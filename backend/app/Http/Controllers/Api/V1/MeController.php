<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class MeController extends Controller
{
    #[OA\Get(
        path: '/api/v1/me',
        operationId: 'getCurrentUser',
        summary: 'Get current authenticated user',
        description: 'Returns the currently authenticated Sanctum user.',
        tags: ['me'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Authenticated user returned',
                content: new OA\JsonContent(
                    properties: [
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
                                    example: 'Tester',
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
                ),
            ),
            new OA\Response(
                response: 401,
                description: 'Missing or invalid authentication',
            ),
        ],
    )]
    public function __invoke(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user(),
        ]);
    }
}