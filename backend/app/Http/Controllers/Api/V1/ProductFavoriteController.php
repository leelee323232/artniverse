<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\PublicProductData;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductFavoriteController extends Controller
{
    public function index(Request $request, PublicProductData $serializer): JsonResponse
    {
        $input = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:100'],
            'page' => ['sometimes', 'integer', 'min:1', 'max:1000000'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);
        $relationship = DB::table('product_favorites')->where('user_id', $request->user()->getAuthIdentifier())
            ->whereColumn('product_favorites.product_id', 'products.id');
        $query = $this->visible()->whereExists((clone $relationship)->selectRaw('1'));
        $totalFavorites = (clone $query)->count();
        $search = trim($input['search'] ?? '');
        if ($search !== '') {
            $pattern = '%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], mb_strtolower($search)).'%';
            $query->where(function (Builder $query) use ($pattern): void {
                $query->whereRaw("LOWER(name) LIKE ? ESCAPE '!'", [$pattern])
                    ->orWhereRaw("LOWER(category) LIKE ? ESCAPE '!'", [$pattern])
                    ->orWhereRaw("LOWER(creator_name) LIKE ? ESCAPE '!'", [$pattern]);
            });
        }
        $page = $query->orderByDesc((clone $relationship)->select('created_at'))->orderByDesc('id')
            ->paginate($input['per_page'] ?? 20);
        return $this->json([
            'data' => $page->getCollection()->map(fn (Product $product) => array_merge(
                $serializer->serialize($product), ['isFavorited' => true, 'canFavorite' => true]
            ))->values(),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(),
                'per_page' => $page->perPage(), 'total' => $page->total(), 'totalFavorites' => $totalFavorites],
        ]);
    }

    public function statuses(Request $request): JsonResponse
    {
        $input = $request->validate([
            'product_ids' => ['required', 'array', 'list', 'min:1', 'max:100'],
            'product_ids.*' => ['required', 'integer', 'min:1', 'distinct'],
        ]);
        $ids = array_values(array_map('strval', $input['product_ids']));
        $visible = $this->visible()->whereIn('id', $ids)->pluck('id')->map(fn ($id) => (string) $id)->all();
        $favorites = DB::table('product_favorites')->where('user_id', $request->user()->getAuthIdentifier())
            ->whereIn('product_id', $ids)->pluck('product_id')->map(fn ($id) => (string) $id)->all();
        // Return only the member's own relationship for hidden/missing IDs, never hidden product data.
        return $this->json(['data' => array_map(fn (string $id) => [
            'productId' => $id, 'isFavorited' => in_array($id, $favorites, true),
            'canFavorite' => in_array($id, $visible, true),
        ], $ids)]);
    }

    public function show(Request $request, string $product): JsonResponse
    {
        abort_unless($this->visible()->whereKey($product)->exists(), 404, '找不到公開商品。');
        return $this->json(['data' => [
            'productId' => $product,
            'isFavorited' => DB::table('product_favorites')->where('user_id', $request->user()->getAuthIdentifier())
                ->where('product_id', $product)->exists(),
            'canFavorite' => true,
        ]]);
    }

    public function store(Request $request, string $product): JsonResponse
    {
        return $this->change($request, $product, true);
    }

    public function destroy(Request $request, string $product): JsonResponse
    {
        return $this->change($request, $product, false);
    }

    private function change(Request $request, string $product, bool $favorite): JsonResponse
    {
        $data = DB::transaction(function () use ($request, $product, $favorite): array {
            $userId = $request->user()->getAuthIdentifier();
            // Serialize concurrent writes for this member; lock product against concurrent archival.
            DB::table('users')->where('id', $userId)->lockForUpdate()->firstOrFail();
            $row = Product::whereKey($product)->lockForUpdate()->first();
            abort_unless($row, 404, '找不到商品。');
            $visible = (bool) $row->is_active && $row->deleted_at === null;
            if ($favorite) abort_unless($visible, 404, '找不到公開商品。');
            $relationship = DB::table('product_favorites')->where('user_id', $userId)->where('product_id', $product);
            if ($favorite && ! (clone $relationship)->exists()) {
                DB::table('product_favorites')->insert(['user_id' => $userId, 'product_id' => $row->id, 'created_at' => now()]);
            } elseif (! $favorite) {
                $relationship->delete();
            }
            return ['productId' => (string) $row->id, 'isFavorited' => $favorite, 'canFavorite' => $visible];
        }, 3);
        return $this->json(['data' => $data]);
    }

    private function visible(): Builder
    {
        // Match ProductController exactly. Sold-out items can still be saved; this does not reserve stock.
        return Product::where('is_active', true)->whereNull('deleted_at');
    }

    private function json(array $data): JsonResponse
    {
        return response()->json($data)->header('Cache-Control', 'private, no-store');
    }
}
