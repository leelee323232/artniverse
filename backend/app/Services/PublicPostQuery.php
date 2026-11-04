<?php

namespace App\Services;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class PublicPostQuery
{
    public static function query(): Builder
    {
        // Feed and likes must agree on which posts are public.
        return DB::table('posts')->whereNull('posts.deleted_at')->where(function (Builder $query): void {
            $query->where(function (Builder $official): void {
                $official->where('posts.author_type', 'official')->whereNull('posts.creator_id');
            })->orWhere(function (Builder $creator): void {
                $creator->where('posts.author_type', 'creator')->whereIn('posts.creator_id',
                    PublicCreatorQuery::query()->select('creators.id'));
            });
        });
    }

    public static function withLikes(Builder $query): Builder
    {
        // Caller selects its base columns first. Avoid a separate count query per card.
        return $query->selectSub(DB::table('post_likes')->selectRaw('COUNT(*)')
            ->whereColumn('post_likes.post_id', 'posts.id'), 'likes_count');
    }
}
