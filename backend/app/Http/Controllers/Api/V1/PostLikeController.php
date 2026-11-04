<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\PublicPostQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PostLikeController extends Controller
{
    public function statuses(Request $request): JsonResponse
    {
        $input = $request->validate([
            'post_ids' => ['required', 'array', 'list', 'min:1', 'max:100'],
            'post_ids.*' => ['required', 'integer', 'min:1', 'distinct'],
        ]);
        $ids = array_map(fn ($id) => (string) (int) $id, $input['post_ids']);
        $visible = PublicPostQuery::withLikes(PublicPostQuery::query()->whereIn('posts.id', $ids)
            ->select('posts.id'))->get()->keyBy('id');
        $liked = DB::table('post_likes')->where('user_id', $request->user()->getAuthIdentifier())
            ->whereIn('post_id', $ids)->pluck('post_id')->map(fn ($id) => (string) $id)->all();
        return $this->json(['data' => array_map(function (string $id) use ($visible, $liked): array {
            $row = $visible->get($id);
            return ['postId' => $id, 'isLiked' => in_array($id, $liked, true),
                'canLike' => $row !== null, 'likes' => $row ? (int) $row->likes_count : null];
        }, $ids)]);
    }

    public function show(Request $request, string $post): JsonResponse
    {
        $row = PublicPostQuery::withLikes(PublicPostQuery::query()->where('posts.id', $post)
            ->select('posts.id'))->first();
        abort_unless($row, 404, '找不到公開貼文。');
        return $this->json(['data' => ['postId' => (string) $row->id,
            'isLiked' => DB::table('post_likes')->where('user_id', $request->user()->getAuthIdentifier())
                ->where('post_id', $row->id)->exists(),
            'canLike' => true, 'likes' => (int) $row->likes_count]]);
    }

    public function store(Request $request, string $post): JsonResponse
    {
        return $this->change($request, $post, true);
    }

    public function destroy(Request $request, string $post): JsonResponse
    {
        return $this->change($request, $post, false);
    }

    private function change(Request $request, string $post, bool $like): JsonResponse
    {
        $data = DB::transaction(function () use ($request, $post, $like): array {
            $userId = $request->user()->getAuthIdentifier();
            // Same lock order as admin post deletion. Unique constraint protects duplicate likes.
            DB::table('users')->where('id', $userId)->lockForUpdate()->firstOrFail();
            $row = DB::table('posts')->where('id', $post)->lockForUpdate()->first();
            abort_unless($row, 404, '找不到貼文。');
            $visible = PublicPostQuery::query()->where('posts.id', $row->id)->exists();
            if ($like) abort_unless($visible, 404, '找不到公開貼文。');
            $relationship = DB::table('post_likes')->where('user_id', $userId)->where('post_id', $row->id);
            if ($like && ! (clone $relationship)->exists()) {
                DB::table('post_likes')->insert(['user_id' => $userId, 'post_id' => $row->id, 'created_at' => now()]);
            } elseif (! $like) {
                $relationship->delete();
            }
            // Permit removing one's own like after hiding/soft deletion without exposing counts.
            return ['postId' => (string) $row->id, 'isLiked' => $like, 'canLike' => $visible,
                'likes' => $visible ? DB::table('post_likes')->where('post_id', $row->id)->count() : null];
        }, 3);
        return $this->json(['data' => $data]);
    }

    private function json(array $data): JsonResponse
    {
        return response()->json($data)->header('Cache-Control', 'private, no-store');
    }
}
