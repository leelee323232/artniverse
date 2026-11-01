<?php

namespace App\Services;

use App\Models\Creator;
use App\Models\CreatorApplication;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CreatorApplicationWorkflow
{
    public function submit(int|string $userId, array $data, string $key, string $hash): CreatorApplication
    {
        return DB::transaction(function () use ($userId, $data, $key, $hash) {
            // All submit/review paths lock the same user first, preventing races.
            $user = User::query()->lockForUpdate()->findOrFail($userId);
            $existing = CreatorApplication::where('user_id', $userId)->where('request_key', $key)->first();
            if ($existing) {
                abort_unless(hash_equals((string) $existing->request_hash, $hash), 409, '同一送件識別碼不可用於不同資料。');
                return $existing;
            }
            abort_if($user->is_creator || Creator::where('user_id', $userId)->exists(), 409, '此會員已具有創作者身分。');
            abort_if(CreatorApplication::where('user_id', $userId)->whereIn('status', ['pending', 'approved'])->exists(), 409, '已有待審核或已通過的申請。');
            return CreatorApplication::create($data + [
                'user_id' => $userId, 'status' => 'pending', 'version' => 1,
                'request_key' => $key, 'request_hash' => $hash,
            ]);
        });
    }

    public function review(CreatorApplication $application, int|string $reviewerId, array $input): CreatorApplication
    {
        return DB::transaction(function () use ($application, $reviewerId, $input) {
            $user = User::query()->lockForUpdate()->findOrFail($application->user_id);
            $app = CreatorApplication::query()->lockForUpdate()->findOrFail($application->id);
            abort_unless($app->status === $input['expectedStatus'] && $app->version === (int) $input['expectedVersion'], 409, '申請狀態已更新，請重新載入後再審核。');
            $target = $input['status'];
            $allowed = ($app->status === 'pending' && in_array($target, ['approved', 'rejected'], true))
                || ($app->status === 'rejected' && $target === 'pending');
            abort_unless($allowed, 409, '不允許此審核狀態變更。');

            if (in_array($target, ['pending', 'approved'], true)) {
                abort_if($user->is_creator || Creator::where('user_id', $user->id)->exists(), 409, '此會員已具有創作者身分。');
                abort_if(CreatorApplication::where('user_id', $user->id)->where('id', '<>', $app->id)->whereIn('status', ['pending', 'approved'])->exists(), 409, '此會員另有有效申請，請先確認。');
            }
            if ($target === 'approved') {
                $documents = new CreatorDocuments;
                abort_unless($app->agree_to_contract && $app->consented_at && $app->contract_snapshot && $app->contract_hash, 409, '缺少合約同意紀錄，請重新送件。');
                abort_unless(hash_equals($app->contract_hash, hash('sha256', $app->contract_snapshot)), 409, '合約紀錄不一致，請確認申請資料。');
                $documents->assertDisk((string) $app->document_disk);
                foreach ([$app->id_front_image, $app->id_back_image] as $path) {
                    abort_unless($documents->validPath($path, $user->id) && Storage::disk($app->document_disk)->exists($path), 409, '證件資料不完整，請重新送件。');
                }
                $creator = new Creator;
                $creator->forceFill([
                    'user_id' => $user->id, 'name' => $app->brand_name,
                    'description' => $app->creative_philosophy,
                    'tags' => json_encode($app->selected_categories, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                    'followers' => 0, 'rating' => 0, 'total_reviews' => 0,
                ])->save();
                $user->forceFill(['is_creator' => true])->save();
            }
            $reason = $target === 'rejected' ? $input['reason'] : null;
            DB::table('creator_application_reviews')->insert([
                'application_id' => $app->id, 'reviewer_id' => $reviewerId,
                'from_status' => $app->status, 'to_status' => $target,
                'reason' => $reason, 'created_at' => now(),
            ]);
            $app->forceFill([
                'status' => $target, 'review_note' => $reason,
                'reviewed_by' => $reviewerId, 'reviewed_at' => now(), 'version' => $app->version + 1,
            ])->save();
            return $app;
        });
    }
}
