<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CreatorDocuments
{
    public function diskName(): string
    {
        $name = (string) config('creator_applications.disk');
        $this->assertDisk($name);
        return $name;
    }

    public function assertDisk(string $name): void
    {
        abort_unless(in_array($name, ['creator_documents', 'r2_private'], true), 503, '證件私有儲存設定不正確。');
        if ($name === 'r2_private') {
            foreach (['key', 'secret', 'bucket', 'endpoint'] as $field) {
                abort_unless(config('filesystems.disks.r2_private.'.$field), 503, '證件私有儲存尚未設定完成。');
            }
            abort_if(config('filesystems.disks.r2_private.bucket') === config('filesystems.disks.r2.bucket'), 503, '證件不可使用公開圖片儲存桶。');
        }
    }

    public function put(string $disk, int|string $userId, UploadedFile $file): string
    {
        $path = Storage::disk($disk)->putFileAs('applications/'.$userId, $file, Str::uuid().'.'.$file->extension(), [
            'ContentType' => $file->getMimeType(), 'CacheControl' => 'private, no-store',
        ]);
        if (! is_string($path)) throw new \RuntimeException('Document upload failed.');
        return $path;
    }

    public function validPath(?string $path, int|string $userId): bool
    {
        // Never fetch a legacy public URL or allow caller-selected filesystem paths.
        return is_string($path) && preg_match('~^applications/'.preg_quote((string) $userId, '~').'/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$~D', $path) === 1;
    }
}
