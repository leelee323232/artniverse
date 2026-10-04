<?php

namespace Database\Factories;

use App\Models\ProductReview;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductReviewFactory extends Factory
{
    protected $model = ProductReview::class;

    public function definition()
    {
        $product = \App\Models\Product::inRandomOrder()->first() ?? \App\Models\Product::factory()->create();
        $user = \App\Models\User::inRandomOrder()->first() ?? \App\Models\User::factory()->create();

        return [
            'product_id' => $product->id,
            'user_id' => $user->id,
            'rating' => round($this->faker->randomFloat(2, 0, 5), 2),
            'content' => $this->faker->paragraph(),
            'images' => json_encode([
                $this->faker->imageUrl(400, 300, 'review'),
                $this->faker->imageUrl(400, 300, 'review')
            ]),
            'helpful' => $this->faker->numberBetween(0, 50),
            'verified' => $this->faker->boolean(30),
        ];
    }
}