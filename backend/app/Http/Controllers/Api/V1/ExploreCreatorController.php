<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\PublicProductData;
use App\Services\PublicCreatorQuery;
use Carbon\CarbonImmutable;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ExploreCreatorController extends Controller
{
    public function followed(Request $request): JsonResponse
    {
        $input = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:100'],
            'page' => ['sometimes', 'integer', 'min:1', 'max:1000000'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);
        $userId = $request->user()->getAuthIdentifier();
        // Reuse public visibility and card fields; never expose application/member details.
        $relationship = DB::table('creator_follows')->where('user_id', $userId)
            ->whereColumn('creator_follows.creator_id', 'creators.id');
        $query = $this->visible()->whereExists((clone $relationship)->selectRaw('1'));
        $totalFollowing = (clone $query)->count();
        $search = trim($input['search'] ?? '');
        if ($search !== '') {
            $pattern = '%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], mb_strtolower($search)).'%';
            $query->where(function (Builder $q) use ($pattern): void {
                $q->whereRaw("LOWER(name) LIKE ? ESCAPE '!'", [$pattern])
                    ->orWhereRaw("LOWER(planet_name) LIKE ? ESCAPE '!'", [$pattern])
                    ->orWhereRaw("LOWER(CAST(tags AS CHAR)) LIKE ? ESCAPE '!'", [$pattern]);
            });
        }
        // Unique member/creator pairs make this a single-row subquery. Newest follows first.
        $page = $query->orderByDesc((clone $relationship)->select('created_at'))
            ->orderByDesc('id')->paginate($input['per_page'] ?? 20, $this->columns());
        return response()->json([
            'data' => $page->getCollection()->map(fn ($creator) => array_merge($this->card($creator), [
                'isFollowing' => true,
            ]))->values(),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(),
                'per_page' => $page->perPage(), 'total' => $page->total(), 'totalFollowing' => $totalFollowing],
        ])->header('Cache-Control', 'private, no-store');
    }

    public function index(Request $request): JsonResponse
    {
        $input = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:100'],
            'tag' => ['sometimes', 'nullable', 'string', 'max:100'],
            'sort' => ['sometimes', Rule::in(['rating', 'followers', 'newest'])],
            'page' => ['sometimes', 'integer', 'min:1', 'max:1000000'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);
        $query = $this->visible();
        $totalCreators = (clone $query)->count();
        $search = trim($input['search'] ?? '');
        if ($search !== '') {
            // Bind parameters and escape LIKE wildcards so % and _ are literal search text.
            $pattern = '%'.str_replace(['!', '%', '_'], ['!!', '!%', '!_'], mb_strtolower($search)).'%';
            $query->where(function (Builder $q) use ($pattern): void {
                $q->whereRaw("LOWER(name) LIKE ? ESCAPE '!'", [$pattern])
                    ->orWhereRaw("LOWER(planet_name) LIKE ? ESCAPE '!'", [$pattern])
                    ->orWhereRaw("LOWER(description) LIKE ? ESCAPE '!'", [$pattern])
                    ->orWhereRaw("LOWER(CAST(tags AS CHAR)) LIKE ? ESCAPE '!'", [$pattern]);
            });
        }
        $tag = trim($input['tag'] ?? '');
        if ($tag !== '') $query->whereJsonContains('tags', $tag);
        match ($input['sort'] ?? 'rating') {
            'followers' => $query->orderByDesc('followers'),
            'newest' => $query->orderByDesc('created_at'),
            default => $query->orderByDesc('rating'),
        };
        // Stable order prevents ties from randomly moving between pages.
        $page = $query->orderByDesc('id')->paginate($input['per_page'] ?? 20, $this->columns());
        return $this->json([
            'data' => $page->getCollection()->map(fn ($creator) => $this->card($creator))->values(),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(),
                'per_page' => $page->perPage(), 'total' => $page->total(), 'totalCreators' => $totalCreators],
        ]);
    }

    public function tags(): JsonResponse
    {
        // Only labels from publicly visible creators; no fixed demo categories.
        $tags = [];
        foreach ($this->visible()->select('tags')->cursor() as $creator) {
            foreach ($this->tagList($creator->tags) as $tag) {
                $tags[$tag] = true;
            }
        }
        $labels = array_map('strval', array_keys($tags));
        sort($labels, SORT_STRING);
        return $this->json(['data' => $labels]);
    }

    public function show(string $creator): JsonResponse
    {
        $row = $this->visible()->where('id', $creator)->first($this->columns());
        abort_unless($row, 404, '找不到公開創作者。');
        $data = $this->card($row);
        // Public profile only: never expose member contact information or application documents.
        $data['totalReviews'] = $data['reviewCount'];
        $data['joinedDate'] = $row->created_at
            ? CarbonImmutable::parse($row->created_at, config('app.timezone'))->timezone('Asia/Taipei')->format('Y年n月')
            : null;
        $data['productCount'] = $this->creatorProducts($creator)->count();
        $data['capabilities'] = ['posts' => false, 'superSubscription' => false, 'tips' => false, 'commissions' => false, 'follow' => true];
        return $this->json(['data' => $data]);
    }

    public function products(Request $request, string $creator, PublicProductData $serializer): JsonResponse
    {
        // Check visibility even if this creator currently has no products.
        abort_unless($this->visible()->where('id', $creator)->exists(), 404, '找不到公開創作者。');
        $input = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1', 'max:1000000'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'sort' => ['sometimes', Rule::in(['default', 'newest', 'price_asc', 'price_desc'])],
        ]);
        $query = $this->creatorProducts($creator);
        match ($input['sort'] ?? 'default') {
            'newest' => $query->orderByDesc('created_at'),
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            default => $query->orderBy('sort_order'),
        };
        $page = $query->orderByDesc('id')->paginate($input['per_page'] ?? 20);
        return $this->json([
            'data' => $page->getCollection()->map(fn (Product $product) => $serializer->serialize($product))->values(),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(),
                'per_page' => $page->perPage(), 'total' => $page->total()],
        ]);
    }

    private function creatorProducts(string $creator): \Illuminate\Database\Eloquent\Builder
    {
        // Match by creator ID, not brand text or user ID. This phase serves general products only.
        // Sold-out products may still be displayed; checkout enforces stock availability.
        return Product::where('creator_id', $creator)->where('product_type', 'general')
            ->where('is_active', true)->whereNull('deleted_at');
    }

    private function visible(): Builder
    {
        // Legacy standalone creators remain public. Linked members must retain creator status.
        return PublicCreatorQuery::query();
    }

    private function columns(): array
    {
        // The relation is authoritative, including after user deletion cascades.
        // Keep the old aggregate column untouched; do not pretend legacy numbers are real follows.
        return ['id', 'name', 'planet_name', 'description', 'tags',
            DB::raw('(SELECT COUNT(*) FROM creator_follows WHERE creator_follows.creator_id = creators.id) AS followers'),
            'rating', 'total_reviews', 'color', 'avatar_url', 'created_at'];
    }

    private function tagList(mixed $value): array
    {
        $tags = is_array($value) ? $value : json_decode((string) $value, true);
        if (! is_array($tags) || ! array_is_list($tags)) return [];
        return array_values(array_unique(array_filter($tags, fn ($tag) => is_string($tag) && trim($tag) !== '' && mb_strlen($tag) <= 100)));
    }

    private function card(object $creator): array
    {
        $image = trim((string) $creator->avatar_url);
        // A missing public image gets a frontend placeholder, never a private member/document URL.
        if (! filter_var($image, FILTER_VALIDATE_URL) || strtolower((string) parse_url($image, PHP_URL_SCHEME)) !== 'https') $image = null;
        $color = preg_match('/^#[0-9a-fA-F]{6}$/D', (string) $creator->color) ? $creator->color : '#a78bfa';
        return [
            'id' => (string) $creator->id,
            'name' => trim((string) $creator->planet_name) !== '' ? $creator->planet_name : $creator->name,
            'creator' => $creator->name, 'description' => $creator->description ?? '',
            'tags' => $this->tagList($creator->tags), 'followers' => max(0, (int) $creator->followers),
            'rating' => max(0, min(5, (float) $creator->rating)), 'reviewCount' => max(0, (int) $creator->total_reviews),
            'image' => $image, 'color' => $color, 'createdAt' => $creator->created_at,
        ];
    }

    private function json(array $data): JsonResponse
    {
        // No cached stale visibility after an administrator takes a creator offline.
        return response()->json($data)->header('Cache-Control', 'no-store');
    }
}
