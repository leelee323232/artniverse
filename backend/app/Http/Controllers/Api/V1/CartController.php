<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\User;
use App\Services\CheckoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CartController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $rows = DB::table('cart_items')->where('user_id', $request->user()->getAuthIdentifier())->orderBy('created_at')->get();
        $products = Product::whereIn('id', $rows->pluck('product_id'))->get()->keyBy('id');
        return response()->json(['data' => $rows->map(function ($row) use ($products) {
            $product = $products->get($row->product_id);
            return [
                'id' => (string) $row->id, 'productId' => (string) $row->product_id,
                'name' => $product?->name ?? $row->name,
                'price' => (float) ($product?->price ?? $row->price), 'quantity' => (int) $row->quantity,
                'image' => $product ? $this->image($product) : $row->image,
                'creator' => $product?->creator_name ?? $row->creator_name,
                'creatorId' => (string) ($product?->creator_id ?? $row->creator_id),
                'stock' => (int) ($product?->stock ?? 0),
                'isAvailable' => $product && (bool) ($product->is_active ?? true)
                    && ($product->product_type ?? 'general') === 'general' && $product->stock > 0,
            ];
        })->values()])->header('Cache-Control', 'private, no-store');
    }

    public function store(Request $request, CheckoutService $checkout): JsonResponse
    {
        $data = $request->validate(['product_id' => ['required', 'integer', 'min:1'], 'quantity' => ['required', 'integer', 'min:1', 'max:99']]);
        DB::transaction(function () use ($request, $checkout, $data) {
            $userId = $request->user()->getAuthIdentifier();
            User::whereKey($userId)->lockForUpdate()->firstOrFail();
            $product = Product::whereKey($data['product_id'])->lockForUpdate()->firstOrFail();
            $existing = DB::table('cart_items')->where('user_id', $userId)->where('product_id', $product->id)->first();
            $quantity = ($existing ? (int) $existing->quantity : 0) + (int) $data['quantity'];
            abort_if($quantity > 99, 422, '每項商品最多 99 件。');
            $checkout->assertPurchasable($product, $quantity);
            $values = ['name' => $product->name, 'price' => $product->price, 'quantity' => $quantity,
                'image' => $this->image($product), 'creator_name' => $product->creator_name,
                'creator_id' => $product->creator_id, 'updated_at' => now()];
            if ($existing) {
                DB::table('cart_items')->where('id', $existing->id)->where('user_id', $userId)->update($values);
            } else {
                DB::table('cart_items')->insert($values + ['id' => (string) Str::uuid(), 'user_id' => $userId, 'product_id' => $product->id, 'created_at' => now()]);
            }
        });
        return $this->index($request);
    }

    public function update(Request $request, string $item, CheckoutService $checkout): JsonResponse
    {
        $data = $request->validate(['quantity' => ['required', 'integer', 'min:1', 'max:99']]);
        DB::transaction(function () use ($request, $item, $data, $checkout) {
            $userId = $request->user()->getAuthIdentifier();
            User::whereKey($userId)->lockForUpdate()->firstOrFail();
            $row = DB::table('cart_items')->where('id', $item)->where('user_id', $userId)->first();
            abort_unless($row, 404);
            $product = Product::whereKey($row->product_id)->lockForUpdate()->firstOrFail();
            $checkout->assertPurchasable($product, (int) $data['quantity']);
            DB::table('cart_items')->where('id', $item)->where('user_id', $userId)->update(['quantity' => $data['quantity'], 'updated_at' => now()]);
        });
        return $this->index($request);
    }

    public function destroy(Request $request, string $item): JsonResponse
    {
        DB::transaction(function () use ($request, $item) {
            $userId = $request->user()->getAuthIdentifier();
            User::whereKey($userId)->lockForUpdate()->firstOrFail();
            $count = DB::table('cart_items')->where('id', $item)->where('user_id', $userId)->delete();
            abort_unless($count, 404);
        });
        return $this->index($request);
    }

    private function image(Product $product): string
    {
        $images = is_array($product->image) ? $product->image : json_decode((string) $product->image, true);
        return is_array($images) ? (string) ($images[0] ?? '') : (string) $product->image;
    }
}
