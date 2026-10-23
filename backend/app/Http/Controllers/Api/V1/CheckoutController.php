<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CheckoutOrder;
use App\Models\TapPayPaymentAttempt;
use App\Services\CheckoutService;
use App\Services\TapPayClient;
use App\Services\TapPayPaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1', 'max:1000000'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
            'payment_method' => ['sometimes', 'required', 'in:card,line_pay,atm'],
            'payment_status' => ['sometimes', 'required', 'in:pending,processing,unknown,authorized,paid,failed,cancelled,expired,refunded,partially_refunded'],
        ]);

        // Never accept a user_id from the browser. Reading the list does not call TapPay.
        $query = CheckoutOrder::query()
            ->where('user_id', $request->user()->getAuthIdentifier())
            ->with('latestPaymentAttempt');
        foreach (['payment_method', 'payment_status'] as $field) {
            if (isset($filters[$field])) {
                $query->where($field, $filters[$field]);
            }
        }
        $orders = $query->orderByDesc('created_at')->orderByDesc('id')
            ->paginate((int) ($filters['per_page'] ?? 20));

        return response()->json([
            'data' => $orders->getCollection()->map(fn (CheckoutOrder $order) => $this->orderData($order, false))->values(),
            'meta' => [
                'current_page' => $orders->currentPage(), 'per_page' => $orders->perPage(),
                'last_page' => $orders->lastPage(), 'total' => $orders->total(),
                'from' => $orders->firstItem(), 'to' => $orders->lastItem(),
                'has_more_pages' => $orders->hasMorePages(),
            ],
        ])->header('Cache-Control', 'private, no-store');
    }

    public function configuration(TapPayClient $client): JsonResponse
    {
        return response()->json(['data' => $client->configuration()])->header('Cache-Control', 'no-store');
    }

    public function store(Request $request, CheckoutService $checkout, TapPayClient $client): JsonResponse
    {
        $data = $request->validate([
            'payment_method' => ['sometimes', 'required', 'in:card,line_pay,atm'],
            'idempotency_key' => ['required', 'uuid'],
            'items' => ['required', 'array', 'min:1', 'max:30'],
            'items.*' => ['required', 'array:product_id,quantity'],
            'items.*.product_id' => ['required', 'integer', 'min:1', 'distinct'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
            'contact' => ['required', 'array:name,email,phone,address'],
            'contact.name' => ['required', 'string', 'max:40'],
            'contact.email' => ['required', 'email', 'max:40'],
            'contact.phone' => ['required', 'string', 'regex:/^\+?[0-9]{8,15}$/'],
            'contact.address' => ['required', 'string', 'max:200'],
        ]);
        $data['payment_method'] = $data['payment_method'] ?? 'card';
        $client->assertReady($data['payment_method']);
        $order = $checkout->create($request->user(), $data);
        return $this->orderResponse($order, $order->wasRecentlyCreated ? 201 : 200);
    }

    public function show(Request $request, CheckoutOrder $order): JsonResponse
    {
        $this->authorizeOrder($request, $order);
        return $this->orderResponse($order);
    }

    public function pay(Request $request, CheckoutOrder $order, TapPayPaymentService $payments): JsonResponse
    {
        $this->authorizeOrder($request, $order);
        $data = $request->validate([
            'prime' => ['required', 'string', 'min:10', 'max:100', 'regex:/^[A-Za-z0-9_-]+$/'],
            'payment_method' => ['sometimes', 'required', 'in:card,line_pay,atm'],
        ]);
        abort_if(isset($data['payment_method']) && $data['payment_method'] !== $order->payment_method,
            409, '付款方式與原訂單不符，請使用原訂單的付款方式。');
        $payments->pay($order, $data['prime']);
        return $this->orderResponse($order->fresh());
    }

    public function refresh(Request $request, CheckoutOrder $order, TapPayPaymentService $payments): JsonResponse
    {
        $this->authorizeOrder($request, $order);
        $attempt = TapPayPaymentAttempt::where('checkout_order_id', $order->id)->orderByDesc('attempt_number')->first();
        if ($attempt) {
            $payments->refresh($attempt);
        }
        return $this->orderResponse($order->fresh());
    }

    public function notify(Request $request, TapPayPaymentService $payments): JsonResponse
    {
        $request->validate(['attempt' => ['required', 'uuid'], 'token' => ['required', 'string', 'size:64']]);
        $attempt = TapPayPaymentAttempt::findOrFail($request->query('attempt'));
        abort_unless(hash_equals($attempt->notify_token_hash, hash('sha256', (string) $request->query('token'))), 403);
        // Incoming status/amount/rec_trade_id are untrusted. Always use server-to-server query.
        $payments->refresh($attempt);
        return response()->json(['received' => true]);
    }

    private function authorizeOrder(Request $request, CheckoutOrder $order): void
    {
        abort_unless((string) $order->user_id === (string) $request->user()->getAuthIdentifier(), 404);
    }

    private function orderResponse(CheckoutOrder $order, int $status = 200): JsonResponse
    {
        return response()->json(['data' => $this->orderData($order)], $status)
            ->header('Cache-Control', 'private, no-store');
    }

    private function orderData(CheckoutOrder $order, bool $detail = true): array
    {
        $order->loadMissing('latestPaymentAttempt');
        $attempt = $order->latestPaymentAttempt;
        $data = [
            'id' => $order->id, 'environment' => $order->environment, 'currency' => $order->currency,
            'created_at' => $order->created_at?->toIso8601String(),
            'updated_at' => $order->updated_at?->toIso8601String(),
            'payment_method' => $order->payment_method,
            'items' => $order->items,
            'subtotal' => $order->subtotal, 'shipping' => $order->shipping, 'total' => $order->total,
            'payment_status' => $order->payment_status, 'expires_at' => $order->expires_at->toIso8601String(),
            // Expiry is a separate fact, not proof that an unresolved payment failed.
            'payment_deadline_passed' => $order->expires_at->isPast(),
            'can_pay' => $order->environment === 'sandbox' && !$order->expires_at->isPast()
                && in_array($order->payment_status, ['pending', 'failed', 'cancelled'], true)
                && (!$attempt || in_array($attempt->status, ['failed', 'cancelled'], true)),
            'payment' => $attempt ? [
                'id' => $attempt->id, 'status' => $attempt->status, 'payment_method' => $attempt->payment_method,
                'bank_transaction_id' => $attempt->bank_transaction_id, 'rec_trade_id' => $attempt->rec_trade_id,
                'gateway_status' => $attempt->gateway_status, 'record_status' => $attempt->record_status,
                'payment_expires_at' => $attempt->payment_expires_at?->toIso8601String(),
                'updated_at' => $attempt->updated_at?->toIso8601String(),
                'can_transfer' => $attempt->payment_method === 'atm' && $attempt->status === 'pending'
                    && $attempt->payee_info !== null && $attempt->payment_expires_at?->isFuture() === true,
            ] : null,
        ];
        // Addresses, payment links and virtual accounts are only needed on the owner-only detail page.
        if ($detail) {
            $data['contact'] = $order->contact;
            if ($attempt) {
                $data['payment']['payment_url'] = $attempt->status === 'pending' ? $attempt->payment_url : null;
                $data['payment']['payee_info'] = $attempt->payment_method === 'atm' ? $attempt->payee_info : null;
            }
        }
        return $data;
    }
}
