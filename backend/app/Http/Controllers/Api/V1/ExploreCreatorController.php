<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ExploreCreatorController extends Controller
{
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
        return $this->json(['data' => $this->card($row)]);
    }

    private function visible(): Builder
    {
        // Legacy standalone creators remain public. Linked members must retain creator status.
        return DB::table('creators')->where('is_active', true)->where(function (Builder $query): void {
            $query->whereNull('user_id')->orWhereExists(function (Builder $users): void {
                $users->selectRaw('1')->from('users')->whereColumn('users.id', 'creators.user_id')->where('users.is_creator', true);
            });
        });
    }

    private function columns(): array
    {
        return ['id', 'name', 'planet_name', 'description', 'tags', 'followers', 'rating', 'total_reviews', 'color', 'avatar_url', 'created_at'];
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
