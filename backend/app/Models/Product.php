<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'price',
        'original_price',
        'image',
        'category',
        'category_id',
        'stock',
        'sold',
        'rating',
        'review_count',
        'creator_id',
        'creator_name',
        'description',
        'features',
        'specifications',
        'is_new',
        'is_creator_product',
    ];

    public function creator()
    {
        return $this->belongsTo(Creator::class);
    }
}