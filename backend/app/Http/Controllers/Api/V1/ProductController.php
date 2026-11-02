<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class ProductController extends Controller
{
    #[OA\Get(
        path: '/api/v1/product',
        summary: '取得全部商品',
        tags: ['Products'],
        responses: [
            new OA\Response(
                response: 200,
                description: '成功取得商品列表'
            ),
            new OA\Response(
                response: 401,
                description: '尚未登入'
            ),
        ]
    )]
    // Get All
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Product::where('is_active', true)->whereNull('deleted_at')->get()
                ->map(fn (Product $product) => $this->publicProduct($product)),
        ]);
    }


    #[OA\Get(
        path: '/api/v1/product/{product}',
        summary: '依照 ID 取得商品',
        tags: ['Products'],
        parameters: [
            new OA\Parameter(
                name: 'product',
                description: '商品 ID',
                in: 'path',
                required: true,
                schema: new OA\Schema(
                    type: 'integer',
                    example: 1
                )
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: '成功取得商品'
            ),
            new OA\Response(
                response: 401,
                description: '尚未登入'
            ),
            new OA\Response(
                response: 404,
                description: '找不到商品'
            ),
        ]
    )]
    // Get By ID
    public function show(Product $product): JsonResponse
    {
        abort_unless($product->is_active && $product->deleted_at === null, 404);
        return response()->json([
            'data' => $this->publicProduct($product),
        ]);
    }

    private function publicProduct(Product $product): array
    {
        return app(\App\Services\PublicProductData::class)->serialize($product);
    }
}
