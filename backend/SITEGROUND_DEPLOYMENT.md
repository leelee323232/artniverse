# Laravel 13 API：本機與 SiteGround 測試環境

這個版本包含：

- POST /api/v1/auth/token：使用 email、password 取得 8 小時 Sanctum Token。
- GET /api/v1/health：公開健康檢查。
- GET /api/v1/health/authenticated：需要 Bearer Token，並檢查 health:read ability。
- /api/documentation：L5-Swagger UI。

## 1. 本機第一次安裝

本專案不包含 vendor 或 .env。composer.json 已加入 Laravel 13 相容的
Sanctum 4.3 與 L5-Swagger 11.1。因產出環境沒有 Composer，交付壓縮檔刻意
不包含已經失效的舊 composer.lock；部署前必須先在本機執行：

~~~bash
composer update --with-all-dependencies
~~~

這會產生新的 composer.lock 與 vendor。更新完成後，請將新的
composer.lock 一起提交到 Git。

發布 Swagger 設定：

~~~bash
php artisan vendor:publish --provider "L5Swagger\L5SwaggerServiceProvider"
~~~

Windows PowerShell：

~~~powershell
Copy-Item .env.example .env
php artisan key:generate
~~~

設定 .env 的本機 MySQL 後執行：

~~~bash
php artisan config:clear
php artisan migrate
php artisan l5-swagger:generate
php artisan test
php artisan serve
~~~

開啟：

- Swagger：http://localhost:8000/api/documentation
- Public Health：http://localhost:8000/api/v1/health

## 2. 建立 Swagger 測試帳號

在本機或 SiteGround 測試環境的 .env 暫時設定：

~~~env
APP_ENV=staging
TEST_USER_ENABLED=true
TEST_USER_NAME="Swagger Test User"
TEST_USER_EMAIL=your-test-email@example.com
TEST_USER_PASSWORD=請換成至少12字元的強密碼
~~~

清除舊設定並建立帳號：

~~~bash
php artisan config:clear
php artisan db:seed --class=TestingUserSeeder
~~~

建立成功後，可從 .env 移除 TEST_USER_PASSWORD，再執行：

~~~bash
php artisan config:clear
~~~

Seeder 只允許在 local、testing、staging 環境執行。

## 3. SiteGround 建議目錄

建議為測試 API 建立獨立子網域，例如 api-test.example.com，使用：

~~~text
/home/customer/www/api-test.example.com/
├── backend/       完整 Laravel 專案、.env、vendor
└── public_html/   只放 Laravel public 目錄內容
~~~

不要把 .env、vendor、app、config 放在公開的 public_html。

本專案的 deploy/siteground/public_html 已提供上述目錄配置使用的
index.php 與 .htaccess。部署時：

1. 將完整專案上傳到網站根目錄的 backend。
2. 將 public 目錄內的檔案複製到 public_html。
3. 用 deploy/siteground/public_html/index.php 取代公開目錄的 index.php。
4. 用 deploy/siteground/public_html/.htaccess 取代公開目錄的 .htaccess。

如果 SiteGround 允許直接將 Document Root 指向 backend/public，就不需要
部署範本，直接使用原本的 public/index.php 與 .htaccess。

## 4. SiteGround .env

先在 Site Tools 建立測試 MySQL 資料庫與使用者，再在 backend/.env 設定：

~~~env
APP_NAME="Art Backend Test"
APP_ENV=staging
APP_KEY=
APP_DEBUG=false
APP_URL=https://api-test.example.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=siteground完整資料庫名稱
DB_USERNAME=siteground完整資料庫帳號
DB_PASSWORD=資料庫密碼

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

L5_SWAGGER_GENERATE_ALWAYS=false
~~~

DB_HOST 請以 Site Tools 顯示值為準。SiteGround 的 DB 名稱與帳號通常帶有
主機帳號前綴。

## 5. SiteGround SSH 部署指令

SiteGround 的 PHP 必須選擇 8.3 或更新版本。進入 backend：

~~~bash
cd /home/customer/www/api-test.example.com/backend
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan config:clear
php artisan migrate --force
php artisan l5-swagger:generate
php artisan optimize
~~~

php artisan key:generate 只在測試站第一次建立 .env 時執行，後續部署不可重跑。

若目錄權限出錯：

~~~bash
chmod -R ug+rwX storage bootstrap/cache
~~~

後續部署通常只需：

~~~bash
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan l5-swagger:generate
php artisan optimize
~~~

## 6. Swagger 測試順序

開啟：

~~~text
https://api-test.example.com/api/documentation
~~~

1. 執行 POST /api/v1/auth/token。
2. 輸入測試帳號、密碼與 device_name。
3. 複製回應中的 access_token。
4. 點 Swagger 右上方 Authorize。
5. 只貼上 Token，不要自行加 Bearer 前綴。
6. 執行 GET /api/v1/health/authenticated，應得到 HTTP 200。
7. 清除授權後再執行，應得到 HTTP 401。

公開端點：

~~~text
GET https://api-test.example.com/api/v1/health
~~~

受保護端點：

~~~http
GET /api/v1/health/authenticated
Authorization: Bearer 你的Token
Accept: application/json
~~~

正式環境不應公開 Swagger UI；上線前應停用文件路由，或替文件路由增加
管理員／HTTP Basic Auth 保護。
