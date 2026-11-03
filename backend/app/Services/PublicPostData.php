<?php

namespace App\Services;

use Carbon\CarbonImmutable;

class PublicPostData
{
    public static function serialize(object $post): array
    {
        $official = $post->author_type === 'official';
        $images = json_decode($post->images, true, 512, JSON_THROW_ON_ERROR);
        $avatar = $official ? '/images/logos/logo_sm_white.png' : ($post->creator_avatar ?? '');
        if (! $official && (! filter_var($avatar, FILTER_VALIDATE_URL)
            || strtolower((string) parse_url($avatar, PHP_URL_SCHEME)) !== 'https')) $avatar = '';
        return [
            'id' => (string) $post->id, 'authorType' => $post->author_type,
            // Creator IDs are not member IDs. Official posts do not link to a creator profile.
            'authorId' => $official ? '' : (string) $post->creator_id,
            'creatorId' => $official ? null : (string) $post->creator_id,
            'authorName' => $official ? 'ARTNIVERSE' : ($post->creator_name ?? ''),
            'authorAvatar' => $avatar, 'isVerified' => ! $official,
            'content' => $post->content, 'images' => array_column($images, 'url'),
            'createdAt' => CarbonImmutable::parse($post->created_at, config('app.timezone'))->toIso8601String(),
            'likes' => 0, 'isLiked' => false, 'isSaved' => false, 'comments' => [],
            'capabilities' => ['delete' => false, 'edit' => false, 'like' => false, 'comment' => false, 'save' => false],
        ];
    }
}
