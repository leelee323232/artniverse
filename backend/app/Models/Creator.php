<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Creator extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'tags',
        'followers',
        'rating',
        'total_reviews',
        'color',
        'super_subscription',
    ];
}