<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class ImageUploadController extends Controller
{
    public function __invoke(Request $request): JsonResponse
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
            // SVG and arbitrary files must never be hosted as public image uploads.
            'image' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120', 'dimensions:max_width=10000,max_height=10000'],
        ]);

        $file = $request->file('image');
        $directory = 'images/'.$request->user()->getAuthIdentifier().'/'.now()->format('Y/m');
        $name = Str::uuid().'.'.$file->extension();

        try {
            $disk = Storage::disk('r2');
            $path = $disk->putFileAs($directory, $file, $name, [
                'ContentType' => $file->getMimeType(),
                'CacheControl' => 'public, max-age=31536000, immutable',
            ]);
            if ($path === false) {
                return response()->json(['message' => '圖片上傳失敗，請稍後重試。'], 503);
            }

            // Uploading does not change product ownership or save a product record.
            return response()->json(['data' => [
                'disk' => 'r2',
                'path' => $path,
                'url' => $disk->url($path),
                'mimeType' => $file->getMimeType(),
                'size' => $file->getSize(),
            ]], 201);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json(['message' => '圖片儲存服務暫時無法使用，請稍後重試。'], 503);
        }
    }
}
