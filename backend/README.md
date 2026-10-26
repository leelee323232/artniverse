<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

In addition, [Laracasts](https://laracasts.com) contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

You can also watch bite-sized lessons with real-world projects on [Laravel Learn](https://laravel.com/learn), where you will be guided through building a Laravel application from scratch while learning PHP fundamentals.

## Agentic Development

Laravel's predictable structure and conventions make it ideal for AI coding agents like Claude Code, Cursor, and GitHub Copilot. Install [Laravel Boost](https://laravel.com/docs/ai) to supercharge your AI workflow:

```bash
composer require laravel/boost --dev

php artisan boost:install
```

Boost provides your agent 15+ tools and skills that help agents build Laravel applications while following best practices.

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## 會員資料與 R2 頭像接口（2026-10-26）

以下接口皆使用 `auth:sanctum`，只能操作目前登入的會員。Cookie 登入的前端
在寫入前先取得 `/sanctum/csrf-cookie`，沿用 Axios credentials/XSRF 設定。

| 方法 | 路徑 | 用途 |
| --- | --- | --- |
| GET | `/api/v1/me` | 取得會員資料與個人資料欄位 |
| PATCH | `/api/v1/me` | 更新姓名、電話、生日、地址、簡介 |
| POST | `/api/v1/me/avatar` | 上傳頭像至 R2，並更新會員 avatar |

三者成功均回傳 `{ "data": { ...會員資料 } }`，包含 `id`、`name`、`email`、
`is_creator`、`avatar`、`phone`、`birthday`、`address`、`bio`。
選填欄位可能為 null，生日格式為 `YYYY-MM-DD`。頭像成功狀態為 200。
前端請統一使用 `is_creator`，勿混用 `isCreator`。

PATCH 範例（省略欄位保留原值，選填欄位傳 null 可清空）：

```json
{
  "name": "王小明",
  "phone": "0912-345-678",
  "birthday": "1995-05-20",
  "address": "台北市信義區測試路 1 號",
  "bio": "喜歡插畫與設計。"
}
```

姓名上限 40 字、地址 200 字、簡介 2000 字。電話會去除空白、括號及連字號，
保存為可選 `+` 國碼與 8–15 位數字。生日不可晚於今天。
本接口不接受 email、avatar、is_admin、is_creator 的變更，不會修改會員權限。
既有 Fortify 的 email 更新流程維持原狀；個人資料頁應呼叫上述 PATCH 接口。

頭像使用 multipart/form-data，檔案欄位名稱 `avatar`，不要手動設定 boundary。
支援 JPEG、PNG、WebP、GIF，最多 5 MiB、寬高各不超過 10000 像素。
檔案儲存在 `avatars/{登入會員ID}/{UUID}.{副檔名}`，成功後將公開 URL 寫入 users.avatar。
不要先呼叫通用 `/images` 再提交 URL；此接口直接處理檔案與會員關聯。
上傳失敗保留原頭像；資料庫儲存失敗會嘗試刪除本次新檔。成功更換後不刪舊頭像，
避免破壞歷史引用；舊檔整理需另訂保留政策。

未登入為 401，驗證失敗 422（errors 欄位），限流 429，R2 未設定或故障 503。
Cookie/CSRF 失效可能為 419。前端只在成功後更新會員狀態，失敗不可假裝已儲存。

### 結帳自動帶入約定

前端從 `/me` 讀取 name、email、phone、address，僅作為新結帳的預填值；
缺少的欄位保持空白，允許使用者自行更改。載入或重試不得覆寫已編輯的欄位，
已有 submitted 請求時必須保留原 contact 與 idempotency_key。
建立訂單仍傳送明確的 contact；後端不從 profile 動態覆蓋訂單快照，
結帳修改收件資料也不會回寫會員資料。既有帳號的 Email 若超過結帳 40 字限制，
仍需在結帳時填入符合付款接口限制的收件 Email，不可靜默截斷。

### 部署與 ER 調整

新增 migration `2026_10_26_000000_add_profile_fields_to_users.php`，補齊 users 的
phone varchar(32)、birthday date、address varchar(200)、bio text、avatar text，皆可空。
已存在欄位不重建；DBA 需確認既有型別及長度相容。本 migration 不提供自動刪欄回滾，
down 會拒絕執行，避免刪除部署前已有的會員欄位或資料。

上傳程式後在後端根目錄執行：

```bash
php artisan migrate --force
php artisan config:cache
php artisan route:clear
```

頭像沿用 R2_UPLOADS_ENABLED=true 及 R2 金鑰、bucket、endpoint、url 設定。
目前版本庫的 Composer 檔仍未宣告 S3 adapter；若伺服器尚未安裝，執行：

```bash
composer require league/flysystem-aws-s3-v3:"^3.0" --update-no-dev
```

請將伺服器更新的 composer.json 與 composer.lock 同步回版本庫，避免後續部署遺失依賴。
PHP upload_max_filesize 至少 5M，post_max_size 需大於 5M（例如 8M）。
本次只修改後端，未執行 migration、測試、build 或實際 R2 上傳。
