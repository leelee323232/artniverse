<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\PublicPostData;
use App\Services\PublicPostQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class AdminPostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->admin($request);
        $input = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1', 'max:1000000'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);
        $page = PublicPostQuery::withLikes(DB::table('posts')->select('posts.*'))
            ->where('author_type', 'official')->whereNull('deleted_at')
            ->orderByDesc('created_at')->orderByDesc('id')->paginate($input['per_page'] ?? 20);
        return $this->json(['data' => $page->getCollection()->map(fn ($post) => $this->resource($post))->values(),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(),
                'per_page' => $page->perPage(), 'total' => $page->total()]]);
    }

    public function show(Request $request, string $post): JsonResponse
    {
        $this->admin($request);
        $row = DB::table('posts')->where('id', $post)->where('author_type', 'official')->whereNull('deleted_at')->first();
        abort_unless($row, 404, '找不到貼文。');
        return $this->json(['data' => $this->resource($row)]);
    }

    public function upload(Request $request, ImageUploadController $uploader): JsonResponse
    {
        $this->admin($request);
        // Reuse the existing R2 switch, MIME/size checks and member-owned object path.
        return $uploader($request)->header('Cache-Control', 'private, no-store');
    }

    public function store(Request $request): JsonResponse
    {
        $this->admin($request);
        $input = $request->validate([
            'requestKey' => ['required', 'uuid'],
            // The admin composer only publishes as the brand, never on behalf of a creator.
            'authorType' => ['prohibited'], 'creatorId' => ['prohibited'], 'authorId' => ['prohibited'],
            'content' => ['required', 'string', 'max:500'],
            'imagePaths' => ['sometimes', 'array', 'list', 'max:10'],
            'imagePaths.*' => ['required', 'string', 'max:1024', 'distinct'],
        ]);
        $content = trim($input['content']);
        abort_if($content === '', 422, '請輸入貼文內容。');
        $paths = $input['imagePaths'] ?? [];
        $userId = $request->user()->getAuthIdentifier();
        $key = hash('sha256', 'official:'.$userId.':'.strtolower($input['requestKey']));
        $hash = hash('sha256', json_encode([$content, $paths], JSON_THROW_ON_ERROR));
        // Replays do not depend on R2 availability and never resurrect deleted posts.
        if ($existing = $this->replay($key, $hash)) {
            return $this->json(['data' => $this->resource($existing)]);
        }
        $images = $this->images($paths, (string) $userId);
        [$row, $created] = DB::transaction(function () use ($userId, $key, $hash, $content, $images): array {
            $user = DB::table('users')->where('id', $userId)->lockForUpdate()->first();
            abort_unless($user && $user->is_admin, 403, '僅管理員可管理官方貼文。');
            if ($existing = $this->replay($key, $hash)) return [$existing, false];
            $now = now();
            $id = DB::table('posts')->insertGetId([
                'author_type' => 'official', 'creator_id' => null,
                'created_by' => $userId, 'content' => $content,
                'images' => json_encode($images, JSON_THROW_ON_ERROR),
                'request_key' => $key, 'request_hash' => $hash, 'version' => 1,
                'created_at' => $now, 'updated_at' => $now,
            ]);
            return [DB::table('posts')->where('id', $id)->first(), true];
        }, 3);
        return $this->json(['data' => $this->resource($row)], $created ? 201 : 200);
    }

    public function destroy(Request $request, string $post): JsonResponse
    {
        $this->admin($request);
        $input = $request->validate(['expectedVersion' => ['required', 'integer', 'min:1']]);
        DB::transaction(function () use ($request, $post, $input): void {
            $user = DB::table('users')->where('id', $request->user()->getAuthIdentifier())->lockForUpdate()->first();
            abort_unless($user && $user->is_admin, 403, '僅管理員可管理官方貼文。');
            $row = DB::table('posts')->where('id', $post)->where('author_type', 'official')->lockForUpdate()->first();
            abort_unless($row, 404, '找不到貼文。');
            if ($row->deleted_at !== null) return; // Safe retry after a lost response.
            abort_unless((int) $row->version === (int) $input['expectedVersion'], 409, '貼文已變更，請重新載入。');
            DB::table('posts')->where('id', $post)->update([
                'deleted_at' => now(), 'deleted_by' => $user->id,
                'updated_at' => now(), 'version' => (int) $row->version + 1,
            ]);
            // Keep R2 objects: they may be reused by another post or product.
        }, 3);
        return $this->json(['message' => '貼文已刪除。']);
    }

    private function replay(string $key, string $hash): ?object
    {
        $row = DB::table('posts')->where('request_key', $key)->where('author_type', 'official')->first();
        if ($row) {
            abort_unless(hash_equals($row->request_hash, $hash), 409, '同一發佈識別碼不可用於不同內容。');
            abort_if($row->deleted_at !== null, 409, '此識別碼對應的貼文已刪除，請重新建立貼文。');
        }
        return $row;
    }

    private function images(array $paths, string $userId): array
    {
        if ($paths === []) return [];
        foreach ($paths as $path) {
            abort_unless(str_starts_with($path, 'images/'.$userId.'/') && preg_match(
                '~^images/[0-9]+/[0-9]{4}/[0-9]{2}/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|gif)$~D', $path
            ), 422, '請使用目前帳號上傳的貼文圖片。');
        }
        abort_unless(config('filesystems.disks.r2.url'), 503, 'R2 公開網址尚未設定。');
        $images = [];
        foreach ($paths as $path) {
            try {
                $disk = Storage::disk('r2');
                $exists = $disk->exists($path);
                $url = $disk->url($path);
            } catch (Throwable $exception) {
                report($exception);
                abort(503, '暫時無法讀取 R2 圖片，請稍後重試。');
            }
            abort_unless($exists, 422, '圖片不存在，請重新上傳。');
            $images[] = ['path' => $path, 'url' => $url];
        }
        return $images;
    }

    private function resource(object $post): array
    {
        $images = json_decode($post->images, true, 512, JSON_THROW_ON_ERROR);
        return array_merge(PublicPostData::serialize($post), [
            'imagePaths' => array_column($images, 'path'), 'version' => (int) $post->version,
            'capabilities' => ['delete' => true, 'edit' => false, 'like' => false, 'comment' => false, 'save' => false],
        ]);
    }

    private function admin(Request $request): void
    {
        abort_unless($request->user()->is_admin, 403, '僅管理員可管理官方貼文。');
    }

    private function json(array $data, int $status = 200): JsonResponse
    {
        return response()->json($data, $status)->header('Cache-Control', 'private, no-store');
    }
}
