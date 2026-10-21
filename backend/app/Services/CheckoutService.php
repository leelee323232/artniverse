<?php

namespace App\Services;

use App\Models\CheckoutOrder;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckoutService
{
    public function create(User $user, array $data): CheckoutOrder
    {
        $lines = collect($data['items'])->map(fn ($line) => [
            'product_id' => (int) $line['product_id'], 'quantity' => (int) $line['quantity'],
        ])->sortBy('product_id')->values()->all();
        $contact = collect($data['contact'])->only(['name', 'email', 'phone', 'address'])->sortKeys()->all();
        $method = $data['payment_method'] ?? 'card';
        // Retain the original card hash so pre-upgrade idempotent retries still work.
        $hash = hash('sha256', json_encode($method === 'card' ? [$lines, $contact] : [$lines, $contact, $method], JSON_THROW_ON_ERROR));

        return DB::transaction(function () use ($user, $data, $lines, $contact, $hash, $method) {
            // Serialize creation for this member, including concurrent first submissions.
            User::whereKey($user->getKey())->lockForUpdate()->firstOrFail();
            $existing = CheckoutOrder::where('user_id', $user->getKey())
                ->where('idempotency_key', $data['idempotency_key'])->first();
            if ($existing) {
                abort_unless($existing->payment_method === $method && hash_equals($existing->request_hash, $hash), 409, '同一送單代碼不可使用不同訂單內容或付款方式。');
                return $existing;
            }
            $products = Product::whereIn('id', array_column($lines, 'product_id'))->orderBy('id')->lockForUpdate()->get()->keyBy('id');
            $items = [];
            $creator = null;
            $subtotal = 0;
            foreach ($lines as $line) {
                $product = $products->get($line['product_id']);
                abort_unless($product, 422, '商品不存在。');
                $this->assertPurchasable($product, $line['quantity']);
                $seller = (string) $product->creator_id;
                abort_if($seller === '', 422, '商品缺少創作者資料。');
                abort_if($creator !== null && $creator !== $seller, 422, '請依創作者分組結帳。');
                $creator = $seller;
                // TWD API uses integer dollars. Never silently truncate a decimal price.
                $price = (string) $product->price;
                abort_unless(preg_match('/^\d+(?:\.0{1,2})?$/D', $price), 422, '目前台幣付款只支援整數元商品價格。');
                $unit = (int) $price;
                abort_if($unit < 1 || $unit > 199999, 422, '商品金額不在可付款範圍。');
                $subtotal += $unit * $line['quantity'];
                $items[] = ['product_id' => $product->id, 'name' => $product->name,
                    'creator_id' => $seller, 'unit_price' => $unit, 'quantity' => $line['quantity']];
            }
            $threshold = config('tappay.free_shipping_threshold');
            $shipping = $threshold !== null && $threshold !== '' && $subtotal >= (int) $threshold
                ? 0 : (int) config('tappay.shipping_fee');
            abort_if($subtotal + $shipping > 199999, 422, '訂單金額超過目前付款上限。');
            abort_if($method === 'atm' && ($subtotal + $shipping < 16 || $subtotal + $shipping > 49999), 422, 'ATM 轉帳金額須為新台幣 16 至 49,999 元（含運費）。');
            $order = new CheckoutOrder;
            $order->id = (string) Str::uuid();
            $order->fill(['user_id' => $user->getKey(), 'idempotency_key' => $data['idempotency_key'],
                'request_hash' => $hash, 'environment' => 'sandbox', 'currency' => 'TWD', 'items' => $items,
                'contact' => $contact, 'subtotal' => $subtotal, 'shipping' => $shipping, 'total' => $subtotal + $shipping,
                'payment_method' => $method, 'payment_status' => 'pending', 'expires_at' => now()->addDay()]);
            $order->save();
            return $order;
        });
    }

    public function assertPurchasable(Product $product, int $quantity): void
    {
        $attributes = $product->getAttributes();
        abort_if(isset($attributes['is_active']) && !$product->is_active, 422, '商品已下架。');
        abort_if(($attributes['product_type'] ?? 'general') !== 'general', 422, '本階段僅支援一般商品；競標與預售尚未串接。');
        abort_if((int) $product->stock < $quantity, 422, '商品庫存不足。');
    }
}
