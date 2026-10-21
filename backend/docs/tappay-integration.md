# TapPay 官方測試環境：既有 Laravel 後端串接

本文件記錄信用卡基礎串接與後續查帳修正。只編寫程式，未執行測試、語法／建置驗證、migration 或任何 TapPay 請求。2026-10-20 新增 LINE Pay 與 ATM 後端，部署設定、migration 及新版 API 契約請參閱 [LINE Pay 與 ATM 後端串接](tappay-line-pay-atm.md)。物流、分潤、退款 API 與綁卡仍不在實作範圍。

## 架構及範圍

前端 TapPay Fields 取得 prime → Laravel 依已保存訂單呼叫 TapPay → 3D 驗證（若開啟）→ Laravel 查詢 Record API → 更新訂單付款狀態。

直接使用 TapPay 官方測試環境：付款為 `https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime`，查詢為 `https://sandbox.tappaysdk.com/tpc/transaction/query`。兩者路徑前綴不同，不能把 pay-by-prime 接在 transaction 後面。沒有額外 Node 伺服器，沒有固定 1 元限制。金額使用資料庫商品價格與後端運費設定，拒絕前端自訂金額。

此分支原本沒有訂單模型，因此新增 `checkout_orders` 與 `tappay_payment_attempts`，沒有假設既存正式訂單表。若實際部署另有訂單模組，應先合併模型，不可直接建立第二套正式訂單。

第一階段只接受同創作者的一般商品、TWD 整數價格。競標、預售需要後端得標／期限等資格資料，尚未開放。舊 products 結構未包含 product_type 時，沿用原本一般商品模型。`is_active` 欄位存在時會檢查上架狀態。

## 由你準備的設定

把 `.env.example` 最後的設定補入部署環境的 `.env`，不要提交真實金鑰：

- `TAPPAY_ENABLED=true`；環境固定 `TAPPAY_ENV=sandbox`。
- `TAPPAY_APP_ID`、`TAPPAY_APP_KEY`：Web 應用程式資料。
- `TAPPAY_PARTNER_KEY`：只放後端，不可放 NEXT_PUBLIC 變數、前端或 Git。
- `TAPPAY_MERCHANT_ID`：從 39 個測試商家選一組 Direct Pay；若開 3D，必須選可用 3D 的測試商家。
- `TAPPAY_3D_SECURE=true`：`TAPPAY_RETURN_URL` 設前端付款頁；`TAPPAY_NOTIFY_URL` 設完整的 `https://你的API網域/api/v1/payments/tappay/notify`。兩者不可帶 query 或 fragment。
- 一般非 3D 商家可設 `TAPPAY_3D_SECURE=false`，不使用通知跳轉，付款後由後端查帳。
- `CHECKOUT_SHIPPING_FEE` 必填整數，`CHECKOUT_FREE_SHIPPING_THRESHOLD` 選填。這只是金額政策，沒有物流建單。
- 在 TapPay Portal 登錄 Web 網域及後端實際出口 IP 的測試白名單。

新 migration 僅提供原始檔，尚未執行；由你檢視資料庫結構後安排 migration、配置快取更新與測試。保留 APP_KEY，訂單收件資料使用它加密。

## 前端下一階段使用的 API

除了 TapPay 通知端點，全部需要既有 Sanctum 登入；Cookie 登入沿用 `/sanctum/csrf-cookie` 與 XSRF 設定。不要傳 localStorage 示範商品價格或競標資格作為後端依據。

| Method | 路徑（前綴 /api/v1） | 用途 |
|---|---|---|
| GET | /payments/tappay/config | 前端 App ID／App Key、ready、missing、環境；不回傳 Partner Key |
| POST | /checkout/orders | 後端建立訂單、計價、保存收件資料 |
| GET | /checkout/orders/{id} | 讀取自己的訂單與最後付款紀錄，不呼叫 TapPay |
| POST | /checkout/orders/{id}/pay | 送出 `{ "prime": "前端取得的代碼" }` |
| POST | /checkout/orders/{id}/refresh | 以後端交易 ID 向 TapPay 查帳 |
| POST | /payments/tappay/notify | TapPay 回呼；帶服務端生成的 attempt 與 token query |

建立訂單 payload（ID 必須是資料庫的商品 ID）：

```json
{
  "idempotency_key": "使用者本次結帳產生的 UUID",
  "items": [{ "product_id": 1, "quantity": 2 }],
  "contact": {
    "name": "收件人",
    "email": "buyer@example.com",
    "phone": "0912345678",
    "address": "收件地址"
  }
}
```

重送同一 idempotency_key 與相同內容會回傳原訂單；不同內容回 409。訂單 24 小時有效，重試不延長期限。付款不接受外傳 amount、merchant_id 或 return_url。付款頁依回應 `data.payment.payment_url` 前往驗證；回到頁面後呼叫 refresh，不能信任網址中的 status。

成功回應為 `data`，包含 id、environment、currency、items、contact、subtotal、shipping、total、payment_status、expires_at、can_pay、payment。

狀態：`pending`、`processing`、`unknown`、`authorized`（銀行已授權，尚未請款）、`paid`（交易完成）、`failed`、`cancelled`、`partially_refunded`、`refunded`。退款狀態僅查帳同步，本次未實作退款操作。

- prime 是一次性，不記錄或保存，也不自動重送。
- 付款之前先保存付款紀錄與銀行交易編號；逾時保持 unknown／processing，先查帳。
- 只有查帳確認 failed／cancelled 後才能重試；成功或退款後不可再對原訂單付款。
- 查詢 HTTP／provider 失敗回 502，付款紀錄仍保存；前端保留訂單 ID，改呼叫 refresh。
- 查帳找不到紀錄時保留原狀態，不能當成未扣款。需稍後查詢或人工核對 Portal。
- 通知內容不直接寫入付款成功；檢查通知 token 後重新呼叫 Record API，匹配商家、交易編號、幣別及金額。
- 不把通知 token、prime、Partner Key、完整 cardholder 或原始上游回應寫進日誌。部署存取日誌也應排除 notify query 中的 token。

## 正式上線前仍需完成

### 查詢 502 診斷

為定位 Portal 已授權而本站仍 pending 的情況，`TapPayPaymentService` 會在每次取得 Record API 回應後寫入 INFO `TapPay record query result`。包含固定 query_version、本站訂單／付款紀錄 UUID、查詢方式、時間範圍（毫秒）、TapPay status、回傳與匹配筆數、商家／銀行訂單編號比對結果、匹配紀錄的整數 record_status；不保存完整交易資料。這個日誌不表示已成功更新資料庫。查詢狀態 2 也會記錄，方便分辨空查詢結果與未執行新版查帳程式。

查帳在已取得 `rec_trade_id` 時優先以該 ID 與原交易 Merchant ID 查詢；沒有 ID 時才以銀行訂單編號查詢。必要時間範圍由交易建立前 12 小時至目前時間後 1 分鐘，搭配既有 89 天查詢期限避免超過官方 90 天上限。回應仍須核對交易識別碼、銀行訂單編號、商家、原始金額及幣別。非空回應卻不匹配時明確回報錯誤，不再默默保持 pending；空結果仍保留原狀態、不允許重複付款。record_status=0 同步為 authorized（已授權、未請款），record_status=1 才同步為 paid。此次調整未執行測試或 API 請求，也未直接修改任何訂單狀態。

付款失敗日誌的 `request_context` 包含本次實際送出的 `merchant_id` 與布林值 `three_domain_secure`，用來比對網站 PHP 與 SSH 的設定差異；不重新從 config 推算送單值。只允許這兩個欄位，無效格式的 Merchant ID 省略，不記錄金鑰、完整 payload 或付款憑證。查詢 API 的 context 為空，不用目前設定冒充原交易設定。此資訊僅對更新後新產生的失敗日誌有效，不會補寫舊日誌或觸發付款。

日誌另含 `safe_error_details`：只讀取頂層與 `error` 物件中的 status、code、error_code、errorCode、msg、message、error_description、純文字 error。先移除本次請求的字串值與已知設定金鑰，再遮蔽 URL、Email、長 token、電話／卡號形式與 IPv4，移除控制字元並限制摘要長度。過長、含物件或 HTML 的訊息直接省略。這是錯誤文字的遮蔽摘要，不代表憑證錯誤已獲確認；回應中的任意資料不會直接寫入日誌或回傳前端。

HTTP 非 2xx（包含 403）也會嘗試解析 JSON，但僅將整數 `status` 及 `msg`／`message` 的固定主題分類寫入診斷日誌。新增 `content_type`（只保留允許清單中的媒體類型，排除 header 參數，其他值標示 other）與 `body_format`（是否解析到 JSON 容器）。HTML 或無法解析的內容不會保存。回應類型只能提供線索，不能單憑 HTML 判定是哪個防火牆攔截。

此修改不重送舊交易，不開放未知付款重試，也不能補回修改前的回應。部署只需更新 `app/Services/TapPayClient.php`，不需要 migration 或新增環境變數。HTTP 失敗仍視為未確認，即使錯誤 body 帶有 status=0 也不認定付款成功。

TapPay query 回傳非零 status 時（排除下述 status=2），前端錯誤訊息會附上數字狀態碼，仍回傳 HTTP 502，不會將訂單改成失敗或允許重複付款。

Record API 的 status=2 表示查詢結束，但實際回應仍可能附帶最後一頁的交易紀錄，不能直接視為空結果。status=0 與 status=2 都須檢查 trade_records：非空時經完整交易核對後同步 record_status；只有空陣列才保留原狀態，不憑空結果開放再次付款。缺少或格式錯誤的陣列仍回報 502。query_version=rec-trade-id-v3 用於辨識這項修正。若先前付款被 IP 限制拒絕，修正白名單後查詢並不會重新送出付款；需核對原付款的 gateway_status 與 TapPay 後台紀錄。此例外只適用 query，不套用到 pay-by-prime。官方說明：https://docs.tappaysdk.com/tutorial/en/back.html

上傳更新的 `app/Services/TapPayClient.php` 與 `app/Services/TapPayPaymentService.php` 後，可由操作人員在原付款頁查詢狀態；此次程式修改未執行查詢或測試，不需要 migration 或新增環境變數。

失敗診斷寫入主機本地 `storage/logs/tappay-diagnostics-YYYY-MM-DD.log`，保留 14 天。記錄 operation、failure、HTTP 狀態、TapPay 數字狀態及 message_topics。topics 只表示上游訊息提及的主題，不是已確認的根因。未辨識訊息記為 unclassified。

不保存原始訊息、回應、請求、例外內容、金鑰、卡號、prime、通知 token 或收件資料。診斷使用獨立本地 daily channel，不送到預設外部日誌服務；若日誌無法寫入，不影響付款流程。主機 PHP 執行帳號需能寫入 `storage/logs`。

操作人員可在 Laravel 根目錄讀取最近診斷（請勿分享其他應用日誌或整份 .env）：

```bash
tail -n 30 storage/logs/tappay-diagnostics-*.log
```

## 正式環境限制

此版拒絕 production 設定。不是改一個環境變數就可以正式收款：仍需完成前端真實商品／登入串接、庫存預留及付款後扣庫存、逾期釋放、未完成交易排程查帳、訂單履約、取消／退款策略及對帳；測試交易不會扣庫存、不清空購物車、不出貨。

目前商品庫存只在建單及付款前檢查，並未預留，故不可將這版當作正式銷售流程。固定測試金額方案已撤回；此版以實際訂單金額送官方測試環境，沒有真實扣款。

官方參考：
- https://docs.tappaysdk.com/tutorial/zh/portal.html
- https://docs.tappaysdk.com/tutorial/zh/web/front.html
- https://docs.tappaysdk.com/tutorial/zh/back.html
- https://docs.tappaysdk.com/tutorial/zh/reference.html
