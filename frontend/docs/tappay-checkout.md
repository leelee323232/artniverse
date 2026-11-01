# TapPay 前端串接

目前提供 TapPay 官方測試環境的信用卡、LINE Pay 與 ATM 虛擬帳號。程式中的 `sandbox` 即 TapPay 官方測試環境，沒有另外架設模擬金流服務。ATM 測試帳號不可真實轉帳。

## 使用路徑

1. 登入後在 `/cart/` 的「資料庫商品」勾選同一創作者的一般商品，按「前往結帳」。
2. `/checkout/?source=api&draft=UUID` 填寫收件資料及選擇付款方式，由後端建立訂單。購物車價格只作預覽；不將價格傳給後端。尚未啟用或設定完成的方式不可選擇；建單後付款方式固定，連線逾時仍重送原本方式與同一筆建單資料。
3. `/checkout/payment/?order=UUID` 顯示後端計算的商品小計、運費及總額。信用卡輸入 TapPay 欄位；LINE Pay 先取得付款連結，再按「前往 LINE Pay 付款」，透過 SDK redirect 跳轉；ATM 按下取號後顯示銀行代碼、虛擬帳號、金額與台灣時間繳費期限。
4. 若需要 3D 驗證，按「前往銀行 3D 驗證」。返回付款頁後向後端查詢交易，不採信網址附帶的交易結果。
5. 付款結果未明時使用「查詢付款狀態」。授權成功與付款完成分開顯示，只有後端允許時才能再次付款。

既有「示範商品」仍使用獨立的本機模擬流程，不會送進 TapPay。要使用新流程，必須選資料庫商品。

## 部署設定

- 前端沿用 `NEXT_PUBLIC_API_URL`，指向已部署 Laravel API 的來源。請勿把 Partner Key 放入任何 `NEXT_PUBLIC_*` 變數或前端檔案。
- 前端從 `GET /api/v1/payments/tappay/config` 取得可公開的 App ID / App Key；目前只接受 `enabled=true`、`environment=sandbox`、`ready=true` 及 `methods` 包含訂單選用的付款方式。
- 上述信用卡流程保留舊版設定相容性；LINE Pay / ATM 還須 `methods` 包含 `line_pay` / `atm`，且對應 `method_settings` 的 `ready=true`。前端不配置 Merchant ID 或 Partner Key。
- 必須先部署後端 LINE Pay / ATM 版本及 `2026_10_20_000000_add_payment_methods_to_checkout.php` migration。後端設定 `TAPPAY_LINE_PAY_ENABLED=true`、`TAPPAY_LINE_PAY_MERCHANT_ID=ARTNIVERSE_LINEPAY`、`TAPPAY_ATM_ENABLED=true`、`TAPPAY_ATM_MERCHANT_ID=ARTNIVERSE_ATM`，並完成設定快取更新，才會出現可選用的方式。具體主機指令見後端分支的 `backend/docs/tappay-line-pay-atm.md`。
- 後端需要先部署 checkout migration、Checkout / TapPay API 及 `.env` 設定。這次前端修改不執行 migration 或部署。
- `TAPPAY_RETURN_URL` 設為前端 `/checkout/payment/` 的完整 HTTPS URL，例如 `https://demoart.artniverse.com/checkout/payment/`，不要自行附加查詢字串；後端會加上訂單編號。
- `TAPPAY_NOTIFY_URL` 仍是後端通知端點，不能填前端頁面。
- 沿用 Sanctum 登入 Cookie 與 CSRF；前後端分開網域時，後端須允許正確的前端來源與憑證 Cookie。
- 信用卡欄位載入 `https://js.tappaysdk.com/sdk/tpdirect/v5.19.2`。若網站有 CSP，需依 TapPay 文件允許 SDK、欄位 iframe 與其連線來源。

## 資料與限制

- 原始卡號、安全碼不進入本站 React state、儲存空間或後端 API。前端僅將 TapPay 產生的 prime 傳給後端，Partner Key 與 Merchant ID 由後端使用。
- 建單前將同一筆請求及 UUID 暫存在該分頁的 sessionStorage，連線中斷後可重送相同請求取得同一張訂單。成功後移除暫存的收件資料並保存訂單編號。
- 請保留付款頁網址以便重新開啟原訂單；目前既有示範訂單列表尚未改接後端訂單。
- 本階段沒有物流下單、創作者分潤、庫存保留／扣減或付款後自動清空購物車。運費由後端設定計算；填寫地址不代表已建立物流單。
- 正式環境尚未開放。日後上線需同時調整前後端環境限制與正式商家設定，不能僅替換金鑰。
- ATM 總額（含運費）須為 NT$ 16～49,999；帳號以字串顯示，保留前導零。取號成功仍顯示等待入帳，不視為已付款。期限屆滿或後端不允許轉帳時停止引導繳費，但仍可查詢延遲入帳結果。未新增模擬入帳按鈕。
- LINE Pay / ATM 使用各自的 SDK prime，僅送給後端 `/pay`；不將 prime 保存到瀏覽器儲存空間。跳轉回來不採信網址付款結果，重新由後端查帳。
- API 逾時或狀態未知時阻擋重複送款，請查詢原訂單。未加入定時輪詢，避免觸發查詢頻率限制。

SDK 實作依據：[LINE Pay 官方範例](https://tappay.github.io/tappay-web-example/Line_Pay/)、[ATM 官方範例](https://tappay.github.io/tappay-web-example/Virtual_Account/)。

依使用者要求，本次僅編寫程式，未執行測試、建置、型別檢查、API 驗證或付款請求。
