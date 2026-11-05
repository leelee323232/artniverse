<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\PublicCreatorQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HomeRecommendationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $input = $request->validate([
            'product_limit' => ['sometimes', 'integer', 'min:1', 'max:12'],
            'creator_limit' => ['sometimes', 'integer', 'min:1', 'max:12'],
        ]);

        // Match the shop's currently supported product type and public visibility.
        $products = Product::where('product_type', 'general')
            ->where('is_active', true)->whereNull('deleted_at');
        $selectedProducts = (clone $products)->where('is_popular', true)
            ->inRandomOrder()->limit($input['product_limit'] ?? 3)->get($this->productColumns());
        $productSource = 'popular';
        // Do not pad a nonempty popular selection with unrelated products.
        if ($selectedProducts->isEmpty()) {
            $selectedProducts = $products->inRandomOrder()->limit($input['product_limit'] ?? 3)
                ->get($this->productColumns());
            $productSource = 'all';
        }

        // Creators have no managed popularity flag; use the existing public visibility rules.
        // Select explicit public fields and real relationship counts, never application data.
        $creators = PublicCreatorQuery::query()->inRandomOrder()
            ->limit($input['creator_limit'] ?? 4)
            ->get([
                'id', 'name', 'planet_name', 'tags', 'color', 'avatar_url',
                DB::raw('(SELECT COUNT(*) FROM creator_follows WHERE creator_follows.creator_id = creators.id) AS follower_count'),
                DB::raw("(SELECT COUNT(*) FROM products WHERE products.creator_id = creators.id AND products.product_type = 'general' AND products.is_active = 1 AND products.deleted_at IS NULL) AS product_count"),
            ]);

        return response()->json([
            'data' => [
                'products' => $selectedProducts->map(fn (Product $product) => $this->productCard($product))->values(),
                'creators' => $creators->map(fn (object $creator) => $this->creatorCard($creator))->values(),
            ],
            'meta' => ['productSource' => $productSource, 'creatorSource' => 'all'],
        ])->header('Cache-Control', 'no-store');
    }

    private function productColumns(): array
    {
        return ['id', 'name', 'price', 'original_price', 'image', 'creator_id', 'creator_name', 'is_new', 'is_popular'];
    }

    private function productCard(Product $product): array
    {
        $images = is_string($product->image) ? json_decode($product->image, true) : $product->image;
        if (! is_array($images)) {
            $images = is_string($images) ? [$images] : [$product->image];
        }
        $images = array_values(array_filter($images, fn ($image) => is_string($image) && trim($image) !== ''));
        $price = (float) $product->price;
        $originalPrice = $product->original_price === null ? null : (float) $product->original_price;

        return [
            'id' => (string) $product->id,
            'name' => $product->name,
            'price' => $price,
            'originalPrice' => $originalPrice,
            'image' => $images[0] ?? null,
            'creatorId' => (string) $product->creator_id,
            'creator' => $product->creator_name,
            'isNew' => (bool) $product->is_new,
            'isSale' => $originalPrice !== null && $originalPrice > $price,
            'isPopular' => (bool) $product->is_popular,
        ];
    }

    private function creatorCard(object $creator): array
    {
        $tags = is_array($creator->tags) ? $creator->tags : json_decode((string) $creator->tags, true);
        $tags = is_array($tags) && array_is_list($tags)
            ? array_values(array_unique(array_filter($tags, fn ($tag) => is_string($tag) && trim($tag) !== '' && mb_strlen($tag) <= 100)))
            : [];
        $image = trim((string) $creator->avatar_url);
        if (! filter_var($image, FILTER_VALIDATE_URL) || strtolower((string) parse_url($image, PHP_URL_SCHEME)) !== 'https') {
            $image = null;
        }

        return [
            'id' => (string) $creator->id,
            'name' => trim((string) $creator->planet_name) !== '' ? $creator->planet_name : $creator->name,
            'creator' => $creator->name,
            'tags' => $tags,
            'followers' => (int) $creator->follower_count,
            // Counts public general products, not posts or an invented works total.
            'productCount' => (int) $creator->product_count,
            'image' => $image,
            'color' => preg_match('/^#[0-9a-fA-F]{6}$/D', (string) $creator->color) ? $creator->color : '#a78bfa',
        ];
    }
}
