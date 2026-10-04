<?php

namespace Database\Factories;

use App\Models\ProductCategorySpec;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductCategorySpecFactory extends Factory
{
    protected $model = ProductCategorySpec::class;

    public function definition()
    {
        return [
            'id' => (string) Str::uuid(),
            'name' => $this->faker->word,
            'name_zh' => $this->faker->randomElement(['電子產品','居家','服飾','玩具','美容']),
            'base_cost' => round($this->faker->randomFloat(2, 10, 1000), 2),
            'min_order' => $this->faker->numberBetween(1, 100),
            'has_min_quantity' => $this->faker->boolean(50),
            'print_zones' => json_encode($this->faker->randomElements(['top','bottom','left','right'], 2)),
            'specs' => json_encode([
                ['key' => 'color', 'value' => $this->faker->hexcolor],
                ['key' => 'size', 'value' => $this->faker->randomElement(['S','M','L','XL'])],
            ]),
        ];
    }
}