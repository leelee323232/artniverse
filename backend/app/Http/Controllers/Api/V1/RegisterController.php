<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Fortify\CreateNewUser;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\Response;

class RegisterController extends Controller
{
    #[OA\Post(
        path: '/api/v1/auth/register',
        operationId: 'registerUser',
        summary: 'Register a new user',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: [
                    'name',
                    'email',
                    'password',
                    'password_confirmation',
                ],
                properties: [
                    new OA\Property(
                        property: 'name',
                        type: 'string',
                        example: 'Swagger Tester',
                        maxLength: 255,
                    ),
                    new OA\Property(
                        property: 'email',
                        type: 'string',
                        format: 'email',
                        example: 'new-user@example.com',
                        maxLength: 255,
                    ),
                    new OA\Property(
                        property: 'password',
                        type: 'string',
                        format: 'password',
                        example: 'Test1234!',
                        minLength: 8,
                        writeOnly: true,
                    ),
                    new OA\Property(
                        property: 'password_confirmation',
                        type: 'string',
                        format: 'password',
                        example: 'Test1234!',
                        minLength: 8,
                        writeOnly: true,
                    ),
                ],
                type: 'object',
            ),
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'User registered successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: 'message',
                            type: 'string',
                            example: 'User registered successfully.',
                        ),
                        new OA\Property(
                            property: 'data',
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
                                    example: 'new-user@example.com',
                                ),
                                new OA\Property(
                                    property: 'email_verified_at',
                                    type: 'string',
                                    format: 'date-time',
                                    nullable: true,
                                    example: null,
                                ),
                            ],
                        ),
                    ],
                    type: 'object',
                ),
            ),
            new OA\Response(
                response: 422,
                description: 'Validation failed',
            ),
            new OA\Response(
                response: 429,
                description: 'Too many registration attempts',
            ),
        ],
    )]
    public function __invoke(
        Request $request,
        CreateNewUser $creator,
    ): JsonResponse {
        // 統一將 Email 轉成小寫
        if ($request->filled('email')) {
            $request->merge([
                'email' => Str::lower(
                    (string) $request->input('email')
                ),
            ]);
        }

        $user = $creator->create(
            $request->only([
                'name',
                'email',
                'password',
                'password_confirmation',
            ])
        );

        // 如果 User implements MustVerifyEmail，
        // 這會觸發 Email 驗證通知
        event(new Registered($user));

        return response()->json([
            'message' => 'User registered successfully.',
            'data' => [
                'id' => $user->getKey(),
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
            ],
        ], Response::HTTP_CREATED);
    }
}