<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\PublicCreatorQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CreatorFollowController extends Controller
{
    public function statuses(Request $request): JsonResponse
    {
        $input = $request->validate([
            'creator_ids' => ['required', 'array', 'min:1', 'max:100'],
            'creator_ids.*' => ['required', 'integer', 'min:1', 'distinct'],
        ]);
        $ids = array_values(array_map('strval', $input['creator_ids']));
        $userId = $request->user()->getAuthIdentifier();
        $visible = PublicCreatorQuery::query()->whereIn('id', $ids)->select(['id', 'user_id'])
            ->selectSub(DB::table('creator_follows')->selectRaw('COUNT(*)')
                ->whereColumn('creator_follows.creator_id', 'creators.id'), 'followers')
            ->get()->keyBy('id');
        $following = DB::table('creator_follows')->where('user_id', $userId)
            ->whereIn('creator_id', $ids)->pluck('creator_id')->map(fn ($id) => (string) $id)->all();

        // Include every requested ID. Unavailable creators expose only the member's own
        // relationship, so their follow can still be removed without leaking hidden profiles.
        $data = array_map(function (string $id) use ($visible, $following, $userId): array {
            $row = $visible->get($id);
            return [
                'creatorId' => $id,
                'isFollowing' => in_array($id, $following, true),
                'canFollow' => $row !== null && ($row->user_id === null || (string) $row->user_id !== (string) $userId),
                'followers' => $row ? (int) $row->followers : null,
            ];
        }, $ids);
        return response()->json(['data' => $data])->header('Cache-Control', 'private, no-store');
    }

    public function show(Request $request, string $creator): JsonResponse
    {
        return $this->change($request, $creator, null);
    }

    public function store(Request $request, string $creator): JsonResponse
    {
        return $this->change($request, $creator, true);
    }

    public function destroy(Request $request, string $creator): JsonResponse
    {
        return $this->change($request, $creator, false);
    }

    private function change(Request $request, string $creator, ?bool $follow): JsonResponse
    {
        $data = DB::transaction(function () use ($request, $creator, $follow): array {
            $userId = $request->user()->getAuthIdentifier();
            // Same lock order as the creator application workflow. Serialize duplicate requests.
            DB::table('users')->where('id', $userId)->lockForUpdate()->firstOrFail();
            $row = DB::table('creators')->where('id', $creator)->lockForUpdate()->first();
            abort_unless($row, 404, '找不到創作者。');
            $visible = PublicCreatorQuery::query()->where('id', $creator)->exists();
            // A member may remove their own follow even after a creator is taken offline.
            if ($follow !== false) abort_unless($visible, 404, '找不到公開創作者。');
            $self = $row->user_id !== null && (string) $row->user_id === (string) $userId;
            if ($follow === true) abort_if($self, 422, '無法追蹤自己的創作者頁面。');

            $relationship = DB::table('creator_follows')->where('user_id', $userId)->where('creator_id', $creator);
            $existing = (clone $relationship)->first();
            if ($follow === true && ! $existing) {
                DB::table('creator_follows')->insert(['user_id' => $userId, 'creator_id' => $creator, 'created_at' => now()]);
            } elseif ($follow === false && $existing) {
                $relationship->delete();
            }
            return [
                'creatorId' => (string) $row->id,
                'isFollowing' => $follow ?? ($existing !== null),
                'canFollow' => $visible && ! $self,
                'followers' => $visible ? DB::table('creator_follows')->where('creator_id', $creator)->count() : null,
            ];
        }, 3);
        return response()->json(['data' => $data])->header('Cache-Control', 'private, no-store');
    }
}
