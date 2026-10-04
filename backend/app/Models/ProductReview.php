<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'user_id',
        'user_name',
        'avatar',
        'rating',
        'content',
        'images',
        'helpful',
        'verified',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}