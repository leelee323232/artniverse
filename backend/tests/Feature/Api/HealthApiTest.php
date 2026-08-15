<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class HealthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_health_does_not_require_authentication(): void
    {
        $this->getJson('/api/v1/health')
            ->assertOk()
            ->assertJsonPath('status', 'ok');
    }

    public function test_authenticated_health_rejects_missing_token(): void
    {
        $this->getJson('/api/v1/health/authenticated')
            ->assertUnauthorized();
    }

    public function test_token_endpoint_issues_a_token(): void
    {
        User::factory()->create([
            'email' => 'swagger@example.com',
            'password' => Hash::make('test-password'),
        ]);

        $this->postJson('/api/v1/auth/token', [
            'email' => 'swagger@example.com',
            'password' => 'test-password',
            'device_name' => 'phpunit',
        ])
            ->assertOk()
            ->assertJsonStructure(['token_type', 'access_token', 'expires_at']);

        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    public function test_token_endpoint_rejects_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'swagger@example.com',
        ]);

        $this->postJson('/api/v1/auth/token', [
            'email' => 'swagger@example.com',
            'password' => 'wrong-password',
            'device_name' => 'phpunit',
        ])->assertUnauthorized();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_authenticated_health_accepts_valid_token(): void
    {
        $user = User::factory()->create();
        $plainTextToken = $user
            ->createToken('phpunit', ['health:read'])
            ->plainTextToken;

        $this->withToken($plainTextToken)
            ->getJson('/api/v1/health/authenticated')
            ->assertOk()
            ->assertJsonPath('authenticated', true)
            ->assertJsonPath('user_id', $user->getKey());
    }

    public function test_authenticated_health_rejects_token_without_required_ability(): void
    {
        $user = User::factory()->create();
        $plainTextToken = $user
            ->createToken('phpunit', ['other:ability'])
            ->plainTextToken;

        $this->withToken($plainTextToken)
            ->getJson('/api/v1/health/authenticated')
            ->assertForbidden();
    }
}
