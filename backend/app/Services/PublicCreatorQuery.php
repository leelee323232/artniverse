<?php

namespace App\Services;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class PublicCreatorQuery
{
    public static function query(): Builder
    {
        return DB::table('creators')->where('is_active', true)->where(function (Builder $query): void {
            $query->whereNull('user_id')->orWhereExists(function (Builder $users): void {
                $users->selectRaw('1')->from('users')->whereColumn('users.id', 'creators.user_id')->where('users.is_creator', true);
            });
        });
    }
}
