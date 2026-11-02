<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Throwable;

class AdminProductController extends Controller
{
    public function options(Request $request): JsonResponse
    {
        $this->admin($request);
        return $this->json(['data' => [
            'categories' => DB::table('product_categories')->orderBy('sort_order')->orderBy('id')->get()->map(fn ($c) => [
                'id' => (string) $c->id, 'name' => $c->name, 'isActive' => (bool) $c->is_active,
            ]),
            'creators' => DB::table('creators')->orderBy('name')->get(['id', 'name'])->map(fn ($c) => ['id' => (string) $c->id, 'name' => $c->name]),
            'productTypes' => ['general'], 'maxImageBytes' => 5 * 1024 * 1024,
        ]]);
    }

    public function index(Request $request): JsonResponse
    {
        $this->admin($request);
        $data = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1', 'max:1000000'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'productType' => ['sometimes', Rule::in(['general'])],
            'search' => ['sometimes', 'nullable', 'string', 'max:100'],
            'isActive' => ['sometimes', 'boolean'],
        ]);
        $query = Product::where('product_type', 'general')->whereNull('deleted_at');
        if (! empty($data['search'])) $query->where('name', 'like', '%'.$data['search'].'%');
        if (isset($data['isActive'])) $query->where('is_active', $data['isActive']);
        $page = $query->orderBy('sort_order')->orderByDesc('id')->paginate($data['per_page'] ?? 20);
        return $this->json(['data' => $page->getCollection()->map(fn ($p) => $this->resource($p))->values(),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'total' => $page->total()]]);
    }

    public function show(Request $request, Product $product): JsonResponse
    {
        $this->admin($request);
        $this->general($product);
        return $this->json(['data' => $this->resource($product)]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->admin($request);
        $data = $this->validateInput($request, true);
        $key = hash('sha256', $request->user()->id.':'.strtolower($data['requestKey']));
        unset($data['requestKey']);
        ksort($data);
        $hash = hash('sha256', json_encode($data, JSON_THROW_ON_ERROR));
        $image = $this->imageUrl($request, $data['imagePath']);
        $product = DB::transaction(function () use ($request, $data, $image, $key, $hash) {
            DB::table('users')->where('id', $request->user()->id)->lockForUpdate()->first();
            $existing = Product::where('admin_request_key', $key)->first();
            if ($existing) {
                abort_unless(hash_equals((string) $existing->admin_request_hash, $hash), 409, '同一新增識別碼不可用於不同資料。');
                $this->general($existing);
                return $existing;
            }
            $p = new Product;
            $p->admin_request_key = $key; $p->admin_request_hash = $hash;
            $p->product_type = 'general';
            $p->sold = 0; $p->rating = 0; $p->review_count = 0;
            $p->features = '[]'; $p->specifications = '{}';
            $p->is_new = 0; $p->is_creator_product = 0;
            $p->description = ''; $p->version = 1;
            $p->image = json_encode([$image], JSON_THROW_ON_ERROR);
            $this->assign($p, $data);
            $p->save();
            return $p;
        });
        return $this->json(['data' => $this->resource($product->fresh())], $product->wasRecentlyCreated ? 201 : 200);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $this->admin($request);
        $this->general($product);
        $data = $this->validateInput($request, false);
        $image = isset($data['imagePath']) ? $this->imageUrl($request, $data['imagePath']) : null;
        $product = DB::transaction(function () use ($product, $data, $image) {
            $p = Product::whereKey($product->id)->lockForUpdate()->firstOrFail();
            $this->general($p);
            $this->version($p, $data['expectedVersion']);
            // Absolute stock edits must also match the last observed stock, since checkout may change it.
            if (array_key_exists('stock', $data)) {
                abort_unless((int) $p->stock === (int) $data['expectedStock'], 409, '庫存已變更，請重新載入後再修改。');
            }
            if (isset($data['creatorId'])) {
                abort_unless((string) $p->creator_id === (string) $data['creatorId'], 422, '已建立的商品不可更換創作者，請另建商品。');
            }
            $this->assign($p, $data);
            if ($image !== null) {
                $images = $this->arrayValue($p->image);
                $images[0] = $image; // Preserve any existing gallery images.
                $p->image = json_encode(array_values($images), JSON_THROW_ON_ERROR);
            }
            $p->version = (int) $p->version + 1;
            $p->save();
            return $p;
        });
        return $this->json(['data' => $this->resource($product)]);
    }

    public function destroy(Request $request, Product $product): JsonResponse
    {
        $this->admin($request);
        $data = $request->validate(['expectedVersion' => ['required', 'integer', 'min:1']]);
        DB::transaction(function () use ($product, $data): void {
            $p = Product::whereKey($product->id)->lockForUpdate()->firstOrFail();
            $this->general($p);
            $this->version($p, $data['expectedVersion']);
            // Archive, not physical deletion: retain historical order references and R2 images.
            $p->deleted_at = now(); $p->is_active = false;
            $p->version = (int) $p->version + 1;
            $p->save();
        });
        return $this->json(['message' => '商品已封存。']);
    }

    private function validateInput(Request $request, bool $create): array
    {
        $presence = $create ? 'required' : 'sometimes';
        $data = $request->validate([
            'requestKey' => [$create ? 'required' : 'prohibited', 'uuid'],
            'productType' => ['sometimes', Rule::in(['general'])],
            'name' => [$presence, 'required', 'string', 'max:255'],
            'categoryId' => [$presence, 'required', 'string', 'max:255', 'exists:product_categories,id'],
            'creatorId' => [$presence, 'required', 'integer', 'min:1', 'max:2147483647', 'exists:creators,id'],
            // Checkout currently accepts whole TWD dollars only.
            'price' => [$presence, 'required', 'integer', 'min:1', 'max:199999'],
            'stock' => [$presence, 'required', 'integer', 'min:0', 'max:2147483647'],
            'imagePath' => [$presence, 'required', 'string', 'max:1024'],
            'sortOrder' => [$presence, 'required', 'integer', 'min:0', 'max:2147483647'],
            'isActive' => [$presence, 'required', 'boolean'],
            'isPopular' => ['sometimes', 'boolean'],
            'description' => ['sometimes', 'nullable', 'string', 'max:10000'],
            'styles' => ['sometimes', 'array', 'list', 'max:50'],
            'sizes' => ['sometimes', 'array', 'list', 'max:50'],
            'colors' => ['sometimes', 'array', 'list', 'max:50'],
            'styles.*' => ['array:id,label'], 'sizes.*' => ['array:id,label'], 'colors.*' => ['array:id,label,hex'],
            'styles.*.id' => ['required', 'string', 'max:100', 'distinct'],
            'sizes.*.id' => ['required', 'string', 'max:100', 'distinct'],
            'colors.*.id' => ['required', 'string', 'max:100', 'distinct'],
            'styles.*.label' => ['required', 'string', 'max:100'],
            'sizes.*.label' => ['required', 'string', 'max:100'],
            'colors.*.label' => ['required', 'string', 'max:100'],
            'colors.*.hex' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/D'],
            'expectedVersion' => [$create ? 'prohibited' : 'required', 'integer', 'min:1'],
            'expectedStock' => [$create ? 'prohibited' : 'required_with:stock', 'integer', 'min:0'],
        ]);
        foreach (['styles', 'sizes', 'colors'] as $group) {
            if (! array_key_exists($group, $data)) continue;
            $seen = [];
            foreach ($data[$group] as $i => &$option) {
                $option['label'] = trim($option['label']);
                $key = mb_strtolower(mb_convert_kana($option['label'], 'as', 'UTF-8'));
                if ($key === '' || in_array($key, $seen, true)) {
                    throw ValidationException::withMessages(["$group.$i.label" => '規格名稱不可空白或重複。']);
                }
                $seen[] = $key;
                if ($group === 'colors') $option['hex'] = strtoupper($option['hex']);
            }
            unset($option);
        }
        return $data;
    }

    private function assign(Product $p, array $data): void
    {
        foreach (['name' => 'name', 'price' => 'price', 'stock' => 'stock', 'sortOrder' => 'sort_order', 'isActive' => 'is_active', 'isPopular' => 'is_popular', 'description' => 'description'] as $key => $column) {
            if (array_key_exists($key, $data)) $p->$column = is_string($data[$key]) ? trim($data[$key]) : ($data[$key] ?? '');
        }
        if (isset($data['categoryId'])) {
            $category = DB::table('product_categories')->where('id', $data['categoryId'])->first();
            abort_unless($category && ($category->is_active || (string) $p->category_id === $data['categoryId']), 422, '請選擇啟用的分類。');
            $p->category_id = $category->id; $p->category = $category->name;
        }
        if (isset($data['creatorId'])) {
            $creator = DB::table('creators')->where('id', $data['creatorId'])->first();
            abort_unless($creator, 422, '創作者不存在。');
            $p->creator_id = $creator->id; $p->creator_name = $creator->name;
        }
        foreach (['styles', 'sizes', 'colors'] as $group) {
            if (array_key_exists($group, $data)) $p->$group = json_encode($data[$group], JSON_THROW_ON_ERROR);
        }
    }

    private function imageUrl(Request $request, string $path): string
    {
        // Use the existing authenticated POST /images result; never accept arbitrary remote URLs.
        $prefix = 'images/'.$request->user()->getAuthIdentifier().'/';
        abort_unless(str_starts_with($path, $prefix) && preg_match('~^images/[0-9]+/[0-9]{4}/[0-9]{2}/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|gif)$~D', $path), 422, '請使用目前帳號上傳的商品圖片。');
        abort_unless(config('filesystems.disks.r2.url'), 503, 'R2 公開網址尚未設定。');
        try {
            $disk = Storage::disk('r2');
            $exists = $disk->exists($path);
            $url = $disk->url($path);
        } catch (Throwable $e) {
            abort(503, '暫時無法讀取 R2 圖片，請稍後重試。');
        }
        abort_unless($exists, 422, '圖片不存在，請重新上傳。');
        return $url;
    }

    private function arrayValue(mixed $value): array
    {
        if (is_array($value)) return $value;
        $decoded = json_decode((string) $value, true);
        return is_array($decoded) ? $decoded : [];
    }

    private function resource(Product $p): array
    {
        return [
            'id' => (string) $p->id, 'name' => $p->name, 'productType' => 'general',
            'price' => (float) $p->price, 'stock' => (int) $p->stock,
            'image' => $this->arrayValue($p->image)[0] ?? '',
            'categoryId' => (string) $p->category_id, 'category' => $p->category,
            'creatorId' => (string) $p->creator_id, 'creatorName' => $p->creator_name,
            'description' => $p->description, 'sortOrder' => (int) $p->sort_order,
            'isActive' => (bool) $p->is_active, 'isPopular' => (bool) $p->is_popular,
            'styles' => $this->arrayValue($p->styles), 'sizes' => $this->arrayValue($p->sizes), 'colors' => $this->arrayValue($p->colors),
            'version' => (int) $p->version, 'createdAt' => $p->created_at?->toIso8601String(),
        ];
    }

    private function general(Product $p): void
    {
        abort_if($p->deleted_at !== null, 404, '商品已封存。');
        abort_unless($p->product_type === 'general', 422, '本次僅支援一般商品。');
    }

    private function version(Product $p, int $version): void
    {
        abort_unless((int) $p->version === $version, 409, '商品已被更新，請重新載入後再操作。');
    }

    private function admin(Request $request): void
    {
        abort_unless($request->user()->is_admin, 403, '僅管理員可管理商品。');
    }

    private function json(array $data, int $status = 200): JsonResponse
    {
        return response()->json($data, $status)->header('Cache-Control', 'private, no-store');
    }
}
