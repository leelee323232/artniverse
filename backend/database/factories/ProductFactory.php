<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductCategorySpec;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition()
    {
        return [
            'name' => $this->faker->words(3, true),
            'price' => round($this->faker->randomFloat(2, 100, 5000), 2),
            'original_price' => $this->faker->randomElement([null, round($this->faker->randomFloat(2, 150, 6000), 2)]),
            'image' => json_encode([
                $this->faker->imageUrl(600, 400, 'products', true),
                $this->faker->imageUrl(600, 400, 'products', true)
            ]),
            'stock' => $this->faker->numberBetween(0, 500),
            'sold' => $this->faker->numberBetween(0, 1000),
            'rating' => round($this->faker->randomFloat(2, 0, 5), 2),
            'review_count' => $this->faker->numberBetween(0, 200),
            'creator_id' => \App\Models\Creator::inRandomOrder()->first()->id ?? \App\Models\Creator::factory()->create()->id,
            'category_spec_id' => \App\Models\ProductCategorySpec::inRandomOrder()->first()->id ?? \App\Models\ProductCategorySpec::factory()->create()->id,
            'description' => $this->faker->paragraph(),
            'features' => json_encode($this->faker->words(5)),
            'specifications' => json_encode([
                'size' => $this->faker->randomElement(['S', 'M', 'L', 'XL']),
                'weight' => $this->faker->randomFloat(2, 0.1, 5) . ' kg',
                'material' => $this->faker->word
            ]),
            'is_new' => $this->faker->boolean(20),
            'is_creator_product' => $this->faker->boolean(10),
        ];
    }
}