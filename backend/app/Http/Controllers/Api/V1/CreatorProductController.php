<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Creator;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreatorProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()->is_creator, 403, '僅創作者可查看自己的商品。');

        // Ownership always comes from the authenticated account, never a supplied creator ID.
        // An unpublished creator can still view their own products in the portal.
        $creator = Creator::where('user_id', $request->user()->getAuthIdentifier())->first();
        abort_unless($creator, 403, '此帳號尚未綁定創作者資料。');

        $data = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1', 'max:1000000'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        // Include listed and unlisted products; archived products are excluded.
        // Review applications are a separate workflow, so no synthetic pending records are added.
        $page = Product::where('creator_id', $creator->id)
            ->whereNull('deleted_at')
            ->orderByDesc('created_at')->orderByDesc('id')
            ->paginate($data['per_page'] ?? 20);

        return response()->json([
            'data' => $page->getCollection()->map(fn (Product $product) => $this->resource($product))->values(),
            'meta' => [
                'current_page' => $page->currentPage(),
                'last_page' => $page->lastPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
            ],
        ])->header('Cache-Control', 'private, no-store');
    }

    private function resource(Product $product): array
    {
        $images = is_string($product->image) ? json_decode($product->image, true) : $product->image;
        // Accept legacy single URLs as well as the current JSON image array.
        if (! is_array($images)) {
            $images = is_string($images) ? [$images] : (is_string($product->image) ? [$product->image] : []);
        }
        $images = array_values(array_filter($images, fn ($image) => is_string($image) && trim($image) !== ''));

        // Explicit fields avoid exposing internal admin request keys or future private columns.
        return [
            'id' => (string) $product->id,
            'name' => $product->name,
            'productType' => $product->product_type,
            'price' => (float) $product->price,
            'stock' => (int) $product->stock,
            'sales' => (int) $product->sold,
            'image' => $images[0] ?? '',
            'categoryId' => (string) $product->category_id,
            'category' => $product->category,
            'isActive' => (bool) $product->is_active,
            'status' => $product->is_active ? 'active' : 'inactive',
            'createdAt' => $product->created_at?->toIso8601String(),
        ];
    }
}
