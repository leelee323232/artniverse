<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\Response;

class RevokeAuthTokenController extends Controller
{
    #[OA\Delete(
        path: '/api/v1/auth/token',
        operationId: 'revokeCurrentAuthToken',
        summary: 'Logout and revoke current Sanctum access token',
        description: 'Revokes only the Bearer token used for this request.',
        tags: ['Authentication'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 204,
                description: 'Token revoked successfully',
            ),
            new OA\Response(
                response: 400,
                description: 'Request did not use a revocable API token',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: 'message',
                            type: 'string',
                            example: 'No revocable access token was used.',
                        ),
                    ],
                    type: 'object',
                ),
            ),
            new OA\Response(
                response: 401,
                description: 'Missing or invalid token',
            ),
        ],
    )]
    public function __invoke(Request $request): Response
    {
        $currentToken = $request->user()->currentAccessToken();

        /*
         * Cookie Session 會得到 TransientToken，
         * Bearer Token 才會得到 PersonalAccessToken。
         */
        if (! $currentToken instanceof PersonalAccessToken) {
            return response()->json([
                'message' => 'No revocable access token was used.',
            ], Response::HTTP_BAD_REQUEST);
        }

        $currentToken->delete();

        return response()->noContent();
    }
}