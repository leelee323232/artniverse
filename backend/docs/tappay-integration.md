# TapPay 官方測試環境：既有 Laravel 後端串接

本次只編寫程式，未執行測試、語法／建置驗證、migration 或任何 TapPay 請求。前端尚未修改。物流、分潤、退款 API、綁卡、電子錢包及 ATM 不在這次實作範圍。

## 架構及範圍

前端 TapPay Fields 取得 prime → Laravel 依已保存訂單呼叫 TapPay → 3D 驗證（若開啟）→ Laravel 查詢 Record API → 更新訂單付款狀態。

直接使用 `https://sandbox.tappaysdk.com/tpc/transaction/`，這就是 TapPay 官方測試環境。沒有額外 Node 伺服器，沒有固定 1 元限制。金額使用資料庫商品價格與後端運費設定，拒絕前端自訂金額。

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

此版拒絕 production 設定。不是改一個環境變數就可以正式收款：仍需完成前端真實商品／登入串接、庫存預留及付款後扣庫存、逾期釋放、未完成交易排程查帳、訂單履約、取消／退款策略及對帳；測試交易不會扣庫存、不清空購物車、不出貨。

目前商品庫存只在建單及付款前檢查，並未預留，故不可將這版當作正式銷售流程。固定測試金額方案已撤回；此版以實際訂單金額送官方測試環境，沒有真實扣款。

官方參考：
- https://docs.tappaysdk.com/tutorial/zh/portal.html
- https://docs.tappaysdk.com/tutorial/zh/web/front.html
- https://docs.tappaysdk.com/tutorial/zh/back.html
- https://docs.tappaysdk.com/tutorial/zh/reference.html
