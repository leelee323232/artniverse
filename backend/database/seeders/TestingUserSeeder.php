<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class TestingUserSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing', 'staging'])) {
            throw new RuntimeException('The Swagger test user may only be seeded outside production.');
        }

        $password = config('testing.user.password');

        if (! is_string($password) || strlen($password) < 12) {
            throw new RuntimeException('Set TEST_USER_PASSWORD to at least 12 characters before seeding.');
        }

        User::query()->updateOrCreate(
            ['email' => config('testing.user.email')],
            [
                'name' => config('testing.user.name'),
                'password' => $password,
                'email_verified_at' => now(),
            ],
        );
    }
}
