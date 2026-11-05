<?php

namespace App\Services;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class PublicCreatorQuery
{
    public static function query(): Builder
    {
        // Public creators must belong to an existing member with creator privileges.
        // Keep unlinked legacy records in storage, but exclude them from public features.
        return DB::table('creators')->where('is_active', true)
            ->whereExists(function (Builder $users): void {
                $users->selectRaw('1')->from('users')->whereColumn('users.id', 'creators.user_id')->where('users.is_creator', true);
            });
    }
}
