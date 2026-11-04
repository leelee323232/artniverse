<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\PublicPostQuery;
use App\Services\PublicPostData;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $input = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1', 'max:1000000'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);
        // Both publishing flows feed the same homepage. Hidden/deleted creators' posts
        // must not leak through the feed, even while their historical records are retained.
        $query = PublicPostQuery::query()->leftJoin('creators', 'creators.id', '=', 'posts.creator_id')
            ->select(['posts.*', 'creators.name as creator_name', 'creators.avatar_url as creator_avatar']);
        $page = PublicPostQuery::withLikes($query)->orderByDesc('posts.created_at')->orderByDesc('posts.id')
            ->paginate($input['per_page'] ?? 20);
        return response()->json([
            'data' => $page->getCollection()->map(fn ($post) => PublicPostData::serialize($post))->values(),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(),
                'per_page' => $page->perPage(), 'total' => $page->total()],
        ])->header('Cache-Control', 'no-store');
    }
}
