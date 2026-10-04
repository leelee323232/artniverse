<?php

namespace Database\Factories;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CartItemFactory extends Factory
{
    protected $model = CartItem::class;

    public function definition()
    {
        $user = \App\Models\User::inRandomOrder()->first() ?? \App\Models\User::factory()->create();
        $product = \App\Models\Product::inRandomOrder()->first() ?? \App\Models\Product::factory()->create();

        return [
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => $this->faker->numberBetween(1, 5),
        ];
    }
}