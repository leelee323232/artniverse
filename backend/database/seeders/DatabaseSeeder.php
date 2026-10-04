<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (
            app()->environment(['local', 'testing', 'staging'])
            && config('testing.user.enabled')
        ) {
            $this->call(TestingUserSeeder::class);
        }

        \App\Models\User::factory()->count(3)->create();
        \App\Models\Creator::factory()->count(3)->create();
        \App\Models\ProductCategorySpec::factory()->count(3)->create();
        \App\Models\Product::factory()->count(3)->create();
        \App\Models\CartItem::factory()->count(3)->create();
        \App\Models\ProductReview::factory()->count(3)->create();
    }
}