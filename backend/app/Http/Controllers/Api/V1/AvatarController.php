<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class AvatarController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        if (! config('filesystems.image_uploads_enabled')) {
            return response()->json(['message' => '圖片上傳尚未開放。'], 503);
        }
        foreach (['key', 'secret', 'bucket', 'endpoint', 'url'] as $field) {
            if (! config('filesystems.disks.r2.'.$field)) {
                return response()->json(['message' => '圖片儲存服務尚未設定完成。'], 503);
            }
        }

        $request->validate([
            'avatar' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120', 'dimensions:max_width=10000,max_height=10000'],
        ]);

        $user = $request->user();
        $file = $request->file('avatar');
        $path = null;
        try {
            $disk = Storage::disk('r2');
            $path = $disk->putFileAs(
                'avatars/'.$user->getAuthIdentifier(),
                $file,
                Str::uuid().'.'.$file->extension(),
                ['ContentType' => $file->getMimeType(), 'CacheControl' => 'public, max-age=31536000, immutable'],
            );
            if ($path === false) {
                return response()->json(['message' => '頭像上傳失敗，原頭像未變更。'], 503);
            }
            $url = $disk->url($path);
        } catch (Throwable $exception) {
            report($exception);
            return response()->json(['message' => '頭像上傳失敗，請稍後重試。'], 503);
        }

        try {
            // Only persist the generated URL, never a client-supplied object path.
            $user->forceFill(['avatar' => $url])->saveOrFail();
        } catch (Throwable $exception) {
            report($exception);
            // Clean up only this failed upload. Never delete the previous avatar.
            try {
                $disk->delete($path);
            } catch (Throwable $cleanupException) {
                report($cleanupException);
            }
            return response()->json(['message' => '無法儲存頭像，請稍後重試。'], 503);
        }

        // Old images are retained: they may be referenced by historical records.
        return response()->json(['data' => $user->fresh()])
            ->header('Cache-Control', 'private, no-store');
    }
}
