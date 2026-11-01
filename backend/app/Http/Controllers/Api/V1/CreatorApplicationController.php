<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CreatorApplication;
use App\Services\CreatorApplicationWorkflow;
use App\Services\CreatorDocuments;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class CreatorApplicationController extends Controller
{
    public function options(): JsonResponse
    {
        $text = $this->contract();
        return $this->json(['data' => [
            'categories' => config('creator_applications.categories'),
            'contractVersion' => config('creator_applications.contract_version'),
            'contractHash' => hash('sha256', $text), 'contractContent' => $text,
            'maxImageBytes' => 5 * 1024 * 1024,
            'imageTypes' => ['image/jpeg', 'image/png', 'image/webp'],
        ]]);
    }

    public function latest(Request $request): JsonResponse
    {
        $app = CreatorApplication::where('user_id', $request->user()->id)->latest('id')->first();
        return $this->json(['data' => $app ? $this->details($app) : null]);
    }

    public function store(Request $request, CreatorDocuments $documents, CreatorApplicationWorkflow $workflow): JsonResponse
    {
        if (is_string($request->input('selectedCategories'))) {
            $categories = json_decode($request->input('selectedCategories'), true);
            if (is_array($categories) && array_is_list($categories)) {
                $request->merge(['selectedCategories' => $categories]);
            }
        }
        if (is_string($request->input('phone'))) {
            $request->merge(['phone' => preg_replace('/[\s()\-]+/u', '', $request->input('phone'))]);
        }
        $text = $this->contract();
        $data = $request->validate([
            'requestKey' => ['required', 'uuid'],
            'email' => ['required', 'email', 'max:255'],
            'realName' => ['required', 'string', 'max:100'],
            'brandName' => ['required', 'string', 'max:100'],
            'storePickup' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'regex:/^\+?[0-9]{8,15}$/'],
            'birthday' => ['required', 'date_format:Y-m-d', 'before_or_equal:today'],
            'address' => ['required', 'string', 'max:255'],
            // Frontend currently combines the bank name and code in one string.
            'bankCode' => ['required', 'string', 'max:100'],
            'bankAccount' => ['required', 'string', 'regex:/^[0-9]{6,32}$/'],
            'selectedCategories' => ['present', 'array', 'list', 'max:14'],
            'selectedCategories.*' => ['required', 'string', 'distinct', Rule::in(config('creator_applications.categories'))],
            'creativePhilosophy' => ['required', 'string', 'max:5000'],
            'agreeToContract' => ['required', 'accepted'],
            'contractVersion' => ['required', Rule::in([config('creator_applications.contract_version')])],
            'contractHash' => ['required', Rule::in([hash('sha256', $text)])],
            'idFrontImage' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120', 'dimensions:max_width=10000,max_height=10000'],
            'idBackImage' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120', 'dimensions:max_width=10000,max_height=10000'],
        ]);
        $values = [
            'email' => $data['email'], 'real_name' => $data['realName'], 'brand_name' => $data['brandName'],
            'store_pickup' => $data['storePickup'], 'phone' => $data['phone'], 'birthday' => $data['birthday'],
            'address' => $data['address'], 'bank_code' => $data['bankCode'], 'bank_account' => $data['bankAccount'],
            'selected_categories' => $data['selectedCategories'], 'creative_philosophy' => $data['creativePhilosophy'],
            'agree_to_contract' => true, 'contract_version' => $data['contractVersion'],
            'contract_hash' => $data['contractHash'], 'contract_snapshot' => $text,
        ];
        $hash = hash('sha256', json_encode([
            $values,
            hash_file('sha256', $request->file('idFrontImage')->getRealPath()),
            hash_file('sha256', $request->file('idBackImage')->getRealPath()),
        ], JSON_THROW_ON_ERROR));
        $key = strtolower($data['requestKey']);
        $userId = $request->user()->id;
        // A retry after a lost response returns the original application, without re-uploading.
        $existing = CreatorApplication::where('user_id', $userId)->where('request_key', $key)->first();
        if ($existing) {
            abort_unless(hash_equals((string) $existing->request_hash, $hash), 409, '同一送件識別碼不可用於不同資料。');
            return $this->json(['data' => $this->details($existing)]);
        }
        $disk = $documents->diskName();
        $paths = [];
        try {
            $paths[] = $documents->put($disk, $userId, $request->file('idFrontImage'));
            $paths[] = $documents->put($disk, $userId, $request->file('idBackImage'));
            $app = $workflow->submit($userId, $values + [
                'id_front_image' => $paths[0], 'id_back_image' => $paths[1],
                'document_disk' => $disk, 'consented_at' => now(),
            ], $key, $hash);
        } catch (Throwable $e) {
            $this->cleanup($disk, $paths);
            if ($e instanceof HttpExceptionInterface) throw $e;
            // SQL exceptions may contain bank details: do not log bindings or payloads.
            Log::error('Creator application submission failed.', ['exception_type' => get_class($e)]);
            return $this->json(['message' => '申請暫時無法儲存，請保留原送件識別碼重試。'], 503);
        }
        if (! $app->wasRecentlyCreated) $this->cleanup($disk, $paths);
        return $this->json(['data' => $this->details($app)], $app->wasRecentlyCreated ? 201 : 200);
    }

    public function index(Request $request): JsonResponse
    {
        $this->admin($request);
        $input = $request->validate([
            'status' => ['sometimes', 'required', Rule::in(['pending', 'approved', 'rejected'])],
            'page' => ['sometimes', 'integer', 'min:1', 'max:1000000'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);
        $query = CreatorApplication::query();
        if (isset($input['status'])) $query->where('status', $input['status']);
        $page = $query->orderByDesc('id')->paginate($input['per_page'] ?? 20);
        return $this->json([
            'data' => $page->getCollection()->map(fn ($app) => $this->summary($app))->values(),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'total' => $page->total(), 'per_page' => $page->perPage()],
        ]);
    }

    public function show(Request $request, CreatorApplication $application): JsonResponse
    {
        $this->admin($request);
        return $this->json(['data' => $this->details($application, true)]);
    }

    public function review(Request $request, CreatorApplication $application, CreatorApplicationWorkflow $workflow): JsonResponse
    {
        $this->admin($request);
        $input = $request->validate([
            'status' => ['required', Rule::in(['pending', 'approved', 'rejected'])],
            'expectedStatus' => ['required', Rule::in(['pending', 'approved', 'rejected'])],
            'expectedVersion' => ['required', 'integer', 'min:1'],
            'reason' => ['required_if:status,rejected', 'nullable', 'string', 'max:2000'],
        ]);
        try {
            $app = $workflow->review($application, $request->user()->id, $input);
        } catch (Throwable $e) {
            if ($e instanceof HttpExceptionInterface) throw $e;
            Log::error('Creator application review failed.', ['application_id' => $application->id, 'exception_type' => get_class($e)]);
            return $this->json(['message' => '審核暫時無法完成，請重新載入確認狀態後再試。'], 503);
        }
        return $this->json(['data' => $this->details($app, true)]);
    }

    public function document(Request $request, CreatorApplication $application, string $side, CreatorDocuments $documents)
    {
        $this->admin($request);
        abort_unless(in_array($side, ['front', 'back'], true), 404);
        $path = $side === 'front' ? $application->id_front_image : $application->id_back_image;
        abort_unless($documents->validPath($path, $application->user_id), 404, '證件尚未移至受保護儲存。');
        $documents->assertDisk((string) $application->document_disk);
        try {
            $disk = Storage::disk($application->document_disk);
            abort_unless($disk->exists($path), 404, '找不到證件。');
            $stream = $disk->readStream($path);
            if (! is_resource($stream)) throw new \RuntimeException('Document stream unavailable.');
        } catch (Throwable $e) {
            if ($e instanceof HttpExceptionInterface) throw $e;
            abort(503, '暫時無法讀取證件。');
        }
        $extension = pathinfo($path, PATHINFO_EXTENSION);
        $mime = match ($extension) { 'jpg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp' };
        return response()->stream(function () use ($stream): void {
            try { fpassthru($stream); } finally { fclose($stream); }
        }, 200, [
            'Content-Type' => $mime, 'Content-Disposition' => 'inline; filename="identity-'.$side.'.'.$extension.'"',
            'Cache-Control' => 'private, no-store', 'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private function admin(Request $request): void
    {
        abort_unless($request->user()->is_admin, 403, '僅管理員可查看及審核創作者申請。');
    }

    private function summary(CreatorApplication $app): array
    {
        return [
            'id' => (string) $app->id, 'userId' => (string) $app->user_id,
            'date' => $app->created_at?->timezone('Asia/Taipei')->format('Y-m-d'),
            'createdAt' => $app->created_at?->toIso8601String(),
            'status' => $app->status, 'version' => $app->version, 'rejectReason' => $app->review_note,
            'email' => $app->email, 'realName' => $app->real_name, 'brandName' => $app->brand_name,
            'phone' => $app->phone, 'selectedCategories' => $app->selected_categories ?? [],
        ];
    }

    private function details(CreatorApplication $app, bool $admin = false): array
    {
        $data = $this->summary($app) + [
            'storePickup' => $app->store_pickup, 'birthday' => $app->birthday?->format('Y-m-d'),
            'address' => $app->address, 'bankCode' => $app->bank_code, 'bankAccount' => $app->bank_account,
            'creativePhilosophy' => $app->creative_philosophy, 'agreeToContract' => $app->agree_to_contract,
            'contractVersion' => $app->contract_version, 'contractHash' => $app->contract_hash,
            'consentedAt' => $app->consented_at?->toIso8601String(),
            'reviewedAt' => $app->reviewed_at?->toIso8601String(), 'reviewedBy' => $app->reviewed_by,
        ];
        if ($admin) {
            // Relative API paths; frontend must request blobs with authenticated Axios.
            $data['idFrontImage'] = '/api/v1/admin/creator-applications/'.$app->id.'/documents/front';
            $data['idBackImage'] = '/api/v1/admin/creator-applications/'.$app->id.'/documents/back';
            $data['contractContent'] = $app->contract_snapshot;
            $data['reviewHistory'] = DB::table('creator_application_reviews')->where('application_id', $app->id)->orderBy('id')->get(['from_status', 'to_status', 'reason', 'reviewer_id', 'created_at']);
        }
        return $data;
    }

    private function contract(): string
    {
        $text = file_get_contents(resource_path('contracts/creator-2026-11-01.txt'));
        abort_unless(is_string($text) && $text !== '', 503, '合約內容尚未設定。');
        return $text;
    }

    private function cleanup(string $disk, array $paths): void
    {
        if ($paths === []) return;
        try {
            Storage::disk($disk)->delete($paths);
        } catch (Throwable $e) {
            Log::error('Creator application orphan cleanup failed.', ['disk' => $disk, 'paths' => $paths]);
        }
    }

    private function json(array $data, int $status = 200): JsonResponse
    {
        return response()->json($data, $status)->header('Cache-Control', 'private, no-store');
    }
}
