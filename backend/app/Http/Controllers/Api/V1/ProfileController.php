<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function update(Request $request): JsonResponse
    {
        // Accept formatted phone numbers, but persist checkout-compatible digits.
        if (is_string($request->input('phone'))) {
            $phone = preg_replace('/[\s()\-]+/u', '', $request->input('phone'));
            $request->merge(['phone' => $phone === '' ? null : $phone]);
        }

        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:40'],
            'phone' => ['sometimes', 'nullable', 'string', 'regex:/^\+?[0-9]{8,15}$/'],
            'birthday' => ['sometimes', 'nullable', 'date_format:Y-m-d', 'before_or_equal:today'],
            'address' => ['sometimes', 'nullable', 'string', 'max:200'],
            'bio' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'email' => ['prohibited'],
            'avatar' => ['prohibited'],
            'is_admin' => ['prohibited'],
            'is_creator' => ['prohibited'],
        ]);

        // Explicit allowlist only; never accept another member's ID or permissions.
        $user = $request->user();
        $user->forceFill(collect($data)->only(['name', 'phone', 'birthday', 'address', 'bio'])->all())->save();

        return response()->json(['data' => $user->fresh()])
            ->header('Cache-Control', 'private, no-store');
    }
}
