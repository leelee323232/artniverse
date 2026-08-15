<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class HealthController extends Controller
{
    #[OA\Get(
        path: '/api/v1/health',
        operationId: 'publicHealth',
        summary: 'Public health check',
        tags: ['Health'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Application is running',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'ok'),
                        new OA\Property(property: 'service', type: 'string', example: 'Art Backend'),
                        new OA\Property(property: 'timestamp', type: 'string', format: 'date-time'),
                    ],
                ),
            ),
        ],
    )]
    public function show(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'service' => config('app.name'),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    #[OA\Get(
        path: '/api/v1/health/authenticated',
        operationId: 'authenticatedHealth',
        summary: 'Authenticated health check',
        tags: ['Health'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Token is valid',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'ok'),
                        new OA\Property(property: 'authenticated', type: 'boolean', example: true),
                        new OA\Property(property: 'user_id', type: 'integer', example: 1),
                        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'swagger@example.com'),
                        new OA\Property(property: 'timestamp', type: 'string', format: 'date-time'),
                    ],
                ),
            ),
            new OA\Response(response: 401, description: 'Missing or invalid token'),
            new OA\Response(response: 403, description: 'Token does not have the health:read ability'),
        ],
    )]
    public function authenticated(Request $request): JsonResponse
    {
        abort_unless($request->user()->tokenCan('health:read'), 403, 'Token does not have the required ability.');

        return response()->json([
            'status' => 'ok',
            'authenticated' => true,
            'user_id' => $request->user()->getKey(),
            'email' => $request->user()->email,
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
