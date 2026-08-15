<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;

class AuthTokenController extends Controller
{
    #[OA\Post(
        path: '/api/v1/auth/token',
        operationId: 'issueAuthToken',
        summary: 'Login and issue a Sanctum access token',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: [
                    'email',
                    'password',
                    'device_name',
                ],
                properties: [
                    new OA\Property(
                        property: 'email',
                        type: 'string',
                        format: 'email',
                        example: 'swagger@example.com',
                    ),
                    new OA\Property(
                        property: 'password',
                        type: 'string',
                        format: 'password',
                        example: 'choose-a-strong-password',
                        writeOnly: true,
                    ),
                    new OA\Property(
                        property: 'device_name',
                        type: 'string',
                        maxLength: 100,
                        example: 'local-swagger',
                    ),
                ],
                type: 'object',
            ),
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Login successful and token issued',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: 'token_type',
                            type: 'string',
                            example: 'Bearer',
                        ),
                        new OA\Property(
                            property: 'access_token',
                            type: 'string',
                            example: '1|plain-text-token',
                        ),
                        new OA\Property(
                            property: 'expires_at',
                            type: 'string',
                            format: 'date-time',
                        ),
                        new OA\Property(
                            property: 'user',
                            type: 'object',
                            properties: [
                                new OA\Property(
                                    property: 'id',
                                    type: 'integer',
                                    example: 1,
                                ),
                                new OA\Property(
                                    property: 'name',
                                    type: 'string',
                                    example: 'Swagger Tester',
                                ),
                                new OA\Property(
                                    property: 'email',
                                    type: 'string',
                                    format: 'email',
                                    example: 'swagger@example.com',
                                ),
                                new OA\Property(
                                    property: 'email_verified_at',
                                    type: 'string',
                                    format: 'date-time',
                                    nullable: true,
                                    example: null,
                                ),
                                new OA\Property(
                                    property: 'email_verified',
                                    type: 'boolean',
                                    example: false,
                                ),
                                new OA\Property(
                                    property: 'created_at',
                                    type: 'string',
                                    format: 'date-time',
                                ),
                                new OA\Property(
                                    property: 'updated_at',
                                    type: 'string',
                                    format: 'date-time',
                                ),
                            ],
                        ),
                    ],
                    type: 'object',
                ),
            ),
            new OA\Response(
                response: 401,
                description: 'Invalid credentials',
            ),
            new OA\Response(
                response: 422,
                description: 'Validation failed',
            ),
            new OA\Response(
                response: 429,
                description: 'Too many attempts',
            ),
        ],
    )]
    public function __invoke(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
            ],
            'password' => [
                'required',
                'string',
            ],
            'device_name' => [
                'required',
                'string',
                'max:100',
            ],
        ]);

        $email = Str::lower(
            trim($credentials['email'])
        );

        $user = User::query()
            ->where('email', $email)
            ->first();

        // 不分別透露「Email 不存在」或「密碼錯誤」
        if (
            ! $user ||
            ! Hash::check(
                $credentials['password'],
                $user->password
            )
        ) {
            return response()->json([
                'message' => 'The provided credentials are incorrect.',
            ], 401);
        }

        /*
         * 同一個使用者、同一個 device_name 只保留一組 Token。
         * 避免每次 Swagger 登入都累積新 Token。
         */
        $user->tokens()
            ->where('name', $credentials['device_name'])
            ->delete();

        $expiresAt = now()->addHours(8);

        $token = $user->createToken(
            $credentials['device_name'],
            ['health:read'],
            $expiresAt,
        );

        return response()->json([
            'token_type' => 'Bearer',
            'access_token' => $token->plainTextToken,
            'expires_at' => $expiresAt->toIso8601String(),

            'user' => [
                'id' => $user->getKey(),
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' =>
                    $user->email_verified_at?->toIso8601String(),
                'email_verified' =>
                    $user->email_verified_at !== null,
                'created_at' =>
                    $user->created_at?->toIso8601String(),
                'updated_at' =>
                    $user->updated_at?->toIso8601String(),
            ],
        ]);
    }
}