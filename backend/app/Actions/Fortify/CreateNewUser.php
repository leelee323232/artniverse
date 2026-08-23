<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    /**
     * @param array<string, mixed> $input
     */
    public function create(array $input): User
    {
        $validated = Validator::make(
            $input,
            [
                'name' => [
                    'required',
                    'string',
                    'max:100',
                ],
                'email' => [
                    'required',
                    'string',
                    'email',
                    'max:255',
                    Rule::unique(User::class, 'email'),
                ],
                'password' => [
                    'required',
                    'string',
                    Password::min(8),
                    'confirmed',
                ],
            ],
            [
                'name.required' => '請輸入名稱。',
                'name.max' => '名稱不能超過 100 個字元。',
                'email.required' => '請輸入電子信箱。',
                'email.email' => '電子信箱格式不正確。',
                'email.unique' => '此電子信箱已經註冊。',
                'password.required' => '請輸入密碼。',
                'password.min' => '密碼至少需要 8 個字元。',
                'password.confirmed' => '兩次輸入的密碼不一致。',
            ],
        )->validate();

        $user = new User();
        $user->name = trim($validated['name']);
        $user->email = Str::lower(trim($validated['email']));
        $user->password = Hash::make($validated['password']);

        // 不接受前端指定，避免使用者自行取得創作者權限。
        $user->is_creator = false;

        $user->save();

        return $user;
    }
}