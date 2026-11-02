# 一般商品管理：ER 調整與部署

本次只實作 `admin/products/` 的一般商品後端；不修改競標、預售與前端。沒有執行測試、build 或 migration。

## 資料庫調整

執行 `2026_11_02_000000_add_general_product_management.php`：

| 表 | 新增欄位 | 用途 |
| --- | --- | --- |
| product_categories | id（字串主鍵）、name、is_active、sort_order、timestamps | 分類選單，沿用 products.category_id 的字串 ID |
| products | product_type，預設 general | 商品類型；本次管理 API 僅接受 general |
| products | is_active，預設 true | 上下架 |
| products | is_popular，預設 false | 熱門商品 |
| products | sort_order，預設 0 | 排序 |
| products | styles、sizes、colors，nullable JSON | 款式、尺寸、顏色；每筆含 id、label，顏色另含 hex |
| products | version，預設 1 | 管理操作樂觀鎖 |
| products | deleted_at，nullable timestamp | 封存，不實體刪除 |
| products | admin_request_key（nullable unique）、admin_request_hash | 新增請求去重；儲存 SHA-256，不對外輸出 |

- migration 僅新增缺少欄位。新建分類表時從既有商品匯入分類，不放入前端假資料；相同分類 ID 保留最早商品的名稱。
- 如果已有 product_categories，需 DBA 確認其欄位與上表一致；不覆蓋既有分類。
- 空資料庫需先由 DBA 建立正式分類及創作者，才可新增商品。本次不提供分類管理 API。
- 新增商品必須指定既有 creatorId；建立後不可更換歸屬。沒有自動建立平台創作者或假創作者。
- 原有 image JSON、category/category_id、creator_id/creator_name、features、specifications 等欄位保留。修改主圖保留其餘圖片，未傳入的欄位不變。
- version 只涵蓋管理操作；絕對庫存更新另比對 expectedStock。未實作 SKU 組合庫存、庫存預留、付款扣庫存或競標／預售。
- migration 回復刻意禁止自動刪欄位，由 DBA 評估；避免刪掉既有共享欄位。

## 介面範圍

所有管理端點都要求 Sanctum 登入及 users.is_admin。回應使用 camelCase，data 包裝。

| 方法 | 路徑（前綴 /api/v1） | 用途 |
| --- | --- | --- |
| GET | /admin/products/options | 正式分類與創作者選單 |
| GET | /admin/products | 分頁列表，支援 page、per_page、search、isActive、productType=general |
| GET | /admin/products/{id} | 一般商品詳細資料 |
| POST | /admin/products | 新增一般商品 |
| PATCH | /admin/products/{id} | 部分修改或上下架 |
| DELETE | /admin/products/{id} | 封存 |

新增必填 requestKey（UUID）、name、categoryId、creatorId、price、stock、imagePath、sortOrder、isActive。
選填 isPopular、description、styles、sizes、colors、productType（只接受 general）。
price 為 1–199999 的整數台幣，配合現有結帳限制；stock、sortOrder 為非負整數。
規格每組最多 50 筆，名稱不能空白或重複，顏色須為六位 HEX。

圖片先透過現有 `POST /api/v1/images`（multipart image）上傳，再將回應 path 傳入 imagePath。
後端確認路徑屬於當前管理員、圖片存在於 R2，再由 R2 設定產生公開網址。修改時不換圖即可省略 imagePath。
未成功存檔的上傳可能留下未引用圖片；本次不自動清理 R2，以免影響共用圖片。

PATCH 必填 expectedVersion；若傳 stock 另必填 expectedStock。上下架只需 isActive 與 expectedVersion。
DELETE JSON body 必填 expectedVersion。版本或庫存不符回傳 409，須重新讀取後再操作。
POST 網路結果不明時保留相同 requestKey 與內容重試；相同請求回傳原商品，不會重建。

公開商品查詢排除下架／封存商品；購物車顯示不可用，結帳阻止購買。封存保留訂單快照、原商品與圖片。

## 部署

在後端專案根目錄執行：

```sh
php artisan migrate --force
php artisan optimize:clear
```

需要既有管理員權限 migration 與 R2 六個環境設定。本分支 composer.json/lock 沒有實際鎖定 S3 adapter；若伺服器尚未安裝，請先執行：

```sh
composer require league/flysystem-aws-s3-v3:^3.0 --with-all-dependencies
```

若伺服器之前已安裝且 R2 上傳可用，無須重複安裝。本次未更動 composer 檔或安裝套件；後續應將實際使用的 composer.json/lock 同步回版本庫。

前端尚未串接；後續保留示範商品、與正式 ID 隔離，示範資料不得呼叫寫入 API。需補創作者選單、使用正式分類、先上傳圖片，並帶入 requestKey / expectedVersion / expectedStock。
