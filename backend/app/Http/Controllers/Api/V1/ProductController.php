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
        // Normalize only the public response. Admin writes still use the original JSON columns.
        $data = $product->toArray();
        $specifications = $this->decoded($product->specifications);
        $display = [];
        if (is_array($specifications)) {
            foreach ($specifications as $key => $value) {
                $text = $this->displayValue($value);
                if ($text !== '') $display[(string) $key] = $text;
            }
        }

        foreach (['styles' => '款式', 'sizes' => '尺寸', 'colors' => '顏色'] as $field => $title) {
            $options = $this->decoded($product->$field);
            $normalized = [];
            if (is_array($options) && array_is_list($options)) {
                foreach ($options as $option) {
                    if (! is_array($option) || ! is_string($option['label'] ?? null)) continue;
                    $label = trim($option['label']);
                    if ($label === '') continue;
                    $entry = ['label' => $label];
                    if (is_string($option['id'] ?? null) || is_int($option['id'] ?? null)) {
                        $entry['id'] = (string) $option['id'];
                    }
                    if ($field === 'colors' && is_string($option['hex'] ?? null)
                        && preg_match('/^#[0-9a-fA-F]{6}$/D', $option['hex'])) {
                        $entry['hex'] = strtoupper($option['hex']);
                    }
                    $normalized[] = $entry;
                }
            }
            $data[$field] = $normalized;
            // Current option labels take precedence over a stale same-name display specification.
            // This is a display summary, not a SKU or an order selection.
            if ($normalized !== []) {
                $display[$title] = implode('、', array_unique(array_column($normalized, 'label')));
            }
        }
        // Keep an object even when empty, matching the existing product page's key/value table.
        $data['specifications'] = (object) $display;
        return $data;
    }

    private function decoded(mixed $value): mixed
    {
        return is_string($value) ? json_decode($value, true) : $value;
    }

    private function displayValue(mixed $value): string
    {
        if (is_string($value)) return trim($value);
        if (is_int($value) || is_float($value)) return (string) $value;
        if (is_bool($value)) return $value ? '是' : '否';
        if (is_array($value)) {
            $parts = [];
            $list = array_is_list($value);
            foreach ($value as $key => $item) {
                $text = $this->displayValue($item);
                if ($text !== '') $parts[] = $list ? $text : $key.'：'.$text;
            }
            return implode('、', $parts);
        }
        return '';
    }
}
