<?php

namespace App\Services;

use App\Models\CheckoutOrder;
use App\Models\Product;
use App\Models\TapPayPaymentAttempt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class TapPayPaymentService
{
    public function __construct(private TapPayClient $client, private CheckoutService $checkout) {}

    public function pay(CheckoutOrder $order, string $prime): TapPayPaymentAttempt
    {
        $this->client->assertReady();
        $token = bin2hex(random_bytes(32));
        $attempt = DB::transaction(function () use ($order, $token) {
            $locked = CheckoutOrder::whereKey($order->id)->lockForUpdate()->firstOrFail();
            abort_unless($locked->environment === 'sandbox', 409, '訂單環境不符。');
            abort_if($locked->expires_at->isPast(), 409, '訂單付款期限已過。');
            $previous = TapPayPaymentAttempt::where('checkout_order_id', $locked->id)->orderByDesc('attempt_number')->first();
            // Only a verified decline/cancellation allows another attempt on the same order.
            abort_if($previous && !in_array($previous->status, ['failed', 'cancelled'], true), 409, '此訂單已有付款交易，請先查詢結果，勿重複付款。');
            foreach ($locked->items as $item) {
                $product = Product::findOrFail($item['product_id']);
                $this->checkout->assertPurchasable($product, $item['quantity']);
            }
            $attempt = new TapPayPaymentAttempt;
            $attempt->id = (string) Str::uuid();
            $attempt->fill(['checkout_order_id' => $locked->id, 'attempt_number' => ($previous?->attempt_number ?? 0) + 1, 'environment' => 'sandbox',
                'merchant_id' => config('tappay.merchant_id'), 'bank_transaction_id' => strtoupper(bin2hex(random_bytes(9))),
                'notify_token_hash' => hash('sha256', $token), 'status' => 'processing']);
            $attempt->save();
            $locked->payment_status = 'processing';
            $locked->save();
            return $attempt;
        });
        $contact = $order->contact;
        $payload = ['prime' => $prime, 'merchant_id' => $attempt->merchant_id,
            'amount' => $order->total, 'currency' => $order->currency,
            'details' => mb_substr(collect($order->items)->pluck('name')->implode('、'), 0, 90),
            'order_number' => $attempt->bank_transaction_id, 'bank_transaction_id' => $attempt->bank_transaction_id,
            'cardholder' => ['name' => $contact['name'], 'phone_number' => $contact['phone'], 'email' => $contact['email']],
            'remember' => false, 'three_domain_secure' => (bool) config('tappay.three_domain_secure')];
        if (config('tappay.three_domain_secure')) {
            $payload['result_url'] = [
                'frontend_redirect_url' => config('tappay.return_url').'?order='.rawurlencode($order->id),
                'backend_notify_url' => config('tappay.notify_url').'?attempt='.rawurlencode($attempt->id).'&token='.$token,
            ];
        }
        try {
            $result = $this->client->request('pay-by-prime', $payload);
        } catch (Throwable) {
            // No raw exception logging; preserve durable ID for later reconciliation.
            $this->recordSubmission($attempt, null);
            return $attempt->fresh();
        }
        $this->recordSubmission($attempt, $result);
        // A 0 API status may mean a 3D transaction is pending; only Record API confirms payment.
        return $this->refresh($attempt->fresh());
    }

    private function recordSubmission(TapPayPaymentAttempt $attempt, ?array $result): void
    {
        DB::transaction(function () use ($attempt, $result) {
            // Consistent lock ordering with refresh: order, then attempt.
            $order = CheckoutOrder::whereKey($attempt->checkout_order_id)->lockForUpdate()->firstOrFail();
            $current = TapPayPaymentAttempt::whereKey($attempt->id)->lockForUpdate()->firstOrFail();
            $current->gateway_status = $result['status'] ?? null;
            if (!$current->rec_trade_id && is_string($result['rec_trade_id'] ?? null)) {
                $current->rec_trade_id = $result['rec_trade_id'];
            }
            // A webhook may have reconciled this attempt before the pay response returns.
            if (in_array($current->status, ['processing', 'unknown', 'pending'], true)) {
                $current->status = ($result['status'] ?? null) === 0 ? 'pending' : 'unknown';
                $url = $result['payment_url'] ?? null;
                if (is_string($url) && filter_var($url, FILTER_VALIDATE_URL) && parse_url($url, PHP_URL_SCHEME) === 'https') {
                    $current->payment_url = $url;
                }
                $order->payment_status = $current->status;
                $order->save();
            }
            $current->save();
        });
    }

    public function refresh(TapPayPaymentAttempt $attempt): TapPayPaymentAttempt
    {
        $this->client->assertReady();
        abort_unless($attempt->environment === 'sandbox', 409, '交易環境不符。');
        abort_if($attempt->created_at->lt(now()->subDays(89)), 409, '交易已超過自動查詢期間，請至 TapPay 後台核對。');
        // Serializes callbacks and user refreshes, so an older query cannot overwrite a newer result.
        return DB::transaction(function () use ($attempt) {
            $order = CheckoutOrder::whereKey($attempt->checkout_order_id)->lockForUpdate()->firstOrFail();
            $current = TapPayPaymentAttempt::whereKey($attempt->id)->lockForUpdate()->firstOrFail();
            // Prefer the provider's unique transaction ID once submission returned it.
            // Keep the required time range below 90 days, with tolerance for clock skew.
            $filters = [
                'time' => ['start_time' => $current->created_at->copy()->subHours(12)->getTimestampMs(),
                    'end_time' => now()->addMinute()->getTimestampMs()],
                'merchant_id' => [$current->merchant_id],
            ];
            if ($current->rec_trade_id) {
                $filters['rec_trade_id'] = $current->rec_trade_id;
            } else {
                // A transport timeout may not have returned a provider transaction ID.
                $filters['bank_transaction_id'] = $current->bank_transaction_id;
            }
            try {
                $result = $this->client->request('query', ['records_per_page' => 50, 'page' => 0,
                    'filters' => $filters]);
            } catch (Throwable) {
                abort(502, '交易查詢暫時失敗，請稍後重試；不要重複付款。');
            }
            $this->logQueryResult($current, $filters, $result);
            // End-of-list status 2 may still include the final page's trade records.
            // Reconcile those records with the same checks as status 0; never skip them.
            // Only the validated numeric status is safe to expose to the browser.
            abort_unless(in_array($result['status'], [0, 2], true), 502,
                'TapPay 查詢未成功（狀態碼：'.$result['status'].'），請提供此代碼給管理員；不要重複付款。');
            $records = $result['trade_records'] ?? null;
            abort_unless(is_array($records), 502, 'TapPay 查帳回應缺少交易紀錄陣列，請聯繫管理員。');
            if ($records === []) {
                return $current; // No record yet is not a failed payment and never permits recharging.
            }
            $record = collect($records)->first(fn ($row) => is_array($row)
                && ($current->rec_trade_id
                    ? ($row['rec_trade_id'] ?? null) === $current->rec_trade_id
                    : ($row['bank_transaction_id'] ?? null) === $current->bank_transaction_id));
            abort_unless($record, 502, 'TapPay 已回傳紀錄，但交易識別碼不符，請聯繫管理員；不要重複付款。');
            abort_unless(($record['merchant_id'] ?? null) === $current->merchant_id
                && ($record['bank_transaction_id'] ?? null) === $current->bank_transaction_id
                && ($record['currency'] ?? null) === $order->currency
                && (int) ($record['original_amount'] ?? $record['amount'] ?? -1) === $order->total
                && is_string($record['rec_trade_id'] ?? null)
                && (!$current->rec_trade_id || $current->rec_trade_id === $record['rec_trade_id']),
                502, '交易資料與訂單不一致，請聯繫管理員。');
            $states = [-1 => 'failed', 0 => 'authorized', 1 => 'paid', 2 => 'partially_refunded', 3 => 'refunded', 4 => 'pending', 5 => 'cancelled'];
            $recordStatus = $record['record_status'] ?? null;
            abort_unless(is_int($recordStatus) && array_key_exists($recordStatus, $states), 502, '未知的交易狀態。');
            // Terminal successes cannot be demoted to unpaid by a delayed provider response.
            if (in_array($current->status, ['authorized', 'paid', 'partially_refunded', 'refunded'], true)
                && in_array($states[$recordStatus], ['failed', 'pending'], true)) {
                return $current;
            }
            $current->fill(['rec_trade_id' => $record['rec_trade_id'], 'record_status' => $recordStatus,
                'status' => $states[$recordStatus]]);
            if ($current->status !== 'pending') {
                $current->payment_url = null;
            }
            $current->save();
            // Ignore callbacks from an earlier failed attempt once a new attempt exists.
            $latest = TapPayPaymentAttempt::where('checkout_order_id', $order->id)->orderByDesc('attempt_number')->first();
            if ($latest->id === $current->id) {
                $order->payment_status = $current->status;
                $order->save();
            }
            return $current;
        });
    }

    private function logQueryResult(TapPayPaymentAttempt $attempt, array $filters, array $result): void
    {
        try {
            $records = $result['trade_records'] ?? null;
            $matching = is_array($records) ? array_values(array_filter($records, static fn ($row) =>
                is_array($row) && ($attempt->rec_trade_id
                    ? ($row['rec_trade_id'] ?? null) === $attempt->rec_trade_id
                    : ($row['bank_transaction_id'] ?? null) === $attempt->bank_transaction_id))) : [];
            // Log counts/types and exact-match booleans only, never returned trade/cardholder data.
            $matched = count($matching) === 1 ? $matching[0] : [];
            Log::build([
                'driver' => 'daily', 'path' => storage_path('logs/tappay-diagnostics.log'),
                'level' => 'info', 'days' => 14, 'permission' => 0600,
            ])->info('TapPay record query result', [
                'query_version' => 'rec-trade-id-v3',
                'order_id' => $attempt->checkout_order_id,
                'attempt_id' => $attempt->id,
                'query_by' => isset($filters['rec_trade_id']) ? 'rec_trade_id' : 'bank_transaction_id',
                'start_time_ms' => $filters['time']['start_time'],
                'end_time_ms' => $filters['time']['end_time'],
                'tappay_status' => $result['status'],
                'records_is_array' => is_array($records),
                'record_count' => is_array($records) ? count($records) : null,
                'matching_id_count' => count($matching),
                'merchant_matches' => $matched ? ($matched['merchant_id'] ?? null) === $attempt->merchant_id : null,
                'bank_transaction_matches' => $matched ? ($matched['bank_transaction_id'] ?? null) === $attempt->bank_transaction_id : null,
                'record_status' => is_int($matched['record_status'] ?? null) ? $matched['record_status'] : null,
            ]);
        } catch (Throwable) {
            // Logging failures must not affect reconciliation or expose original exceptions.
        }
    }
}
