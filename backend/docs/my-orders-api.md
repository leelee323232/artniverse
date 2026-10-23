# 我的訂單 API

本版只修改後端，提供目前登入會員的真實 checkout_orders 訂單。信用卡、LINE Pay、ATM 共用列表與明細；前端 `/account/orders/` 與明細頁仍須另行改接 API，不能繼續使用 mockOrders。

## 部署

上傳以下檔案（相對於 backend）：

- `routes/checkout.php`
- `app/Http/Controllers/Api/V1/CheckoutController.php`
- `app/Models/CheckoutOrder.php`

本版沒有新增 migration 或環境變數；依賴既有 checkout 及 LINE Pay / ATM migration 已完成。保留 `routes/api.php` 載入 `checkout.php` 的設定。在主機有 artisan 的目錄，由操作人員自行執行：

```bash
php artisan route:clear
```

若原部署使用路由快取，再執行 `php artisan route:cache`。若主機仍載入舊 PHP 程式，依主機設定重新載入 PHP / OPcache。本次未執行任何主機指令、測試、建置、migration 或付款請求。

## 登入與權限

沿用 `auth:sanctum`、登入 Cookie 與現有 API 節流。列表固定使用登入者 ID，不接受指定他人的 user_id。未登入回 401；非本人或不存在的 UUID 訂單明細回 404。回應使用 `Cache-Control: private, no-store`。

## 訂單列表

```http
GET /api/v1/orders?page=1&per_page=20
GET /api/v1/orders?payment_method=atm&payment_status=pending
```

`GET /api/v1/checkout/orders` 是同功能別名，供沿用 checkout API 的前端使用。

參數：

| 參數 | 說明 |
| --- | --- |
| page | 正整數，預設 1，上限 1,000,000 |
| per_page | 1–50，預設 20 |
| payment_method | card、line_pay、atm；全部請省略 |
| payment_status | pending、processing、unknown、authorized、paid、failed、cancelled、expired、refunded、partially_refunded；全部請省略 |

兩個篩選條件同時傳入時取交集。不合法參數回 422。排序為 created_at 降冪、id 降冪；資料不存在時 data 為空陣列。

回傳結構：

```json
{
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "last_page": 1,
    "total": 0,
    "from": null,
    "to": null,
    "has_more_pages": false
  }
}
```

每筆 data 包含：

- `id`、`environment`、`currency`、`created_at`、`updated_at`。
- `items`：建單時保存的 product_id、name、creator_id、unit_price、quantity。不以商品現價覆蓋歷史價格；未保存的圖片、規格與創作者名稱不偽造，前端可使用預設圖片及 creator_id。
- `subtotal`、`shipping`、`total`：TWD 整數元。
- `payment_method`、`payment_status`、`expires_at`、`payment_deadline_passed`、`can_pay`。
- `payment`：最新付款嘗試或 null。包含 id、status、payment_method、bank_transaction_id、rec_trade_id、gateway_status、record_status、payment_expires_at、updated_at、can_transfer。

列表不回傳 contact、payment.payment_url 或 payment.payee_info；需要收件資訊、LINE Pay 連結或 ATM 帳號時讀取明細。付款嘗試以 attempt_number 最大者為準，列表預先載入關聯，避免逐筆查詢。

## 訂單明細與付款

```http
GET /api/v1/orders/{UUID}
GET /api/v1/checkout/orders/{UUID}
```

兩者回傳相同 `{ "data": {...} }`；在列表單筆欄位之外，包含原有 contact、payment.payment_url、payment.payee_info，保持既有付款頁相容。單筆明細也會回傳新增時間與期限欄位。

繼續付款使用前端 `/checkout/payment/?order={UUID}`。`can_pay=false` 不代表付款失敗，也不代表 ATM 不能繳款；ATM 必須看 can_transfer、payment_expires_at 與後端保存的帳號資訊。測試虛擬帳號不可真實轉帳。

列表和明細只讀資料庫，不逐筆向 TapPay 查帳、不改變付款狀態。即時更新仍使用既有：

```http
POST /api/v1/checkout/orders/{UUID}/refresh
```

此 POST 沿用 CSRF 和節流，回傳最新完整訂單。前端在使用者按查詢或付款返回時使用，勿在列表逐筆自動呼叫，以免觸發頻率限制。入帳通常由 TapPay 通知更新，通知未到時列表可能仍顯示先前狀態。

## 前端狀態顯示

- pending + payment=null：尚未發起付款。
- pending + ATM 帳號：已取號，待確認入帳。
- processing / unknown：處理中或交易結果未確認，勿再次付款。
- authorized：已授權，與 paid（已付款）分開顯示。
- failed / cancelled：是否可再試仍以 can_pay 為準。
- refunded / partially_refunded：已退款 / 部分退款。
- payment_deadline_passed 僅表示時間經過，不會把 pending / unknown 改為付款失敗。payment_status 篩選是資料庫原始值；expired 不會自動包含所有已過期限的 pending 訂單，延遲入帳仍可被查帳確認。

本版未新增物流狀態、物流單號、買家取消、退款操作或賣家訂單管理。前端原有「運送中／已送達」示範分頁不可依付款狀態填入假物流資訊。
