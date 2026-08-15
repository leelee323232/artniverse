<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'Art Backend API',
    description: 'Laravel 13 test API documentation.',
)]
#[OA\SecurityScheme(
    securityScheme: 'sanctum',
    type: 'http',
    description: 'Paste the access_token value only. Swagger UI adds the Bearer prefix automatically.',
    scheme: 'bearer',
    bearerFormat: 'Sanctum token',
)]
#[OA\Tag(name: 'Authentication', description: 'Issue API access tokens.')]
#[OA\Tag(name: 'Health', description: 'Public and authenticated health checks.')]
class OpenApiSpec
{
}
