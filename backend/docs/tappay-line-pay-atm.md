# LINE Pay 與 ATM 後端串接

本版維持 TapPay 官方測試環境，新增 `line_pay`、`atm`，保留 `card`。只修改後端；尚未修改前端、執行 migration、測試、付款、模擬入帳或部署。物流與創作者分潤不在此版範圍。

## 主機部署

上傳以下檔案（路徑相對於 backend）：

- `config/tappay.php`
- `app/Services/TapPayClient.php`
- `app/Services/CheckoutService.php`
- `app/Services/TapPayPaymentService.php`
- `app/Http/Controllers/Api/V1/CheckoutController.php`
- `app/Models/TapPayPaymentAttempt.php`
- `database/migrations/2026_10_20_000000_add_payment_methods_to_checkout.php`

現有 routes/checkout.php 不需新增路由，但部署仍須保留該檔與 routes/api.php 的載入設定。

在主機原 `.env` 加入以下設定，勿覆蓋整份檔案或更換 APP_KEY：

```dotenv
TAPPAY_ENABLED=true
TAPPAY_ENV=sandbox
# 既有信用卡商家與 3D 配對設定保持原值
TAPPAY_MERCHANT_ID=ARTNIVERSE_TAISHIN
TAPPAY_3D_SECURE=false

TAPPAY_LINE_PAY_ENABLED=true
TAPPAY_LINE_PAY_MERCHANT_ID=ARTNIVERSE_LINEPAY
TAPPAY_ATM_ENABLED=true
TAPPAY_ATM_MERCHANT_ID=ARTNIVERSE_ATM
TAPPAY_ATM_EXPIRE_IN_DAYS=1
```

上述商家名稱來自本專案的使用者測試商家清單。App ID、App Key 與 Partner Key 沿用同帳號既有值。`TAPPAY_RETURN_URL` 為完整 HTTPS 前端付款頁；`TAPPAY_NOTIFY_URL` 為完整 HTTPS 後端 `/api/v1/payments/tappay/notify`。LINE Pay 必須有兩者，ATM 必須有 notify URL；設定值不能預先帶 query 或 fragment。後端會附加原訂單或通知驗證參數。通知 URL 僅允許預設 HTTPS port 或 443。

由操作人員確認資料庫及備份後，在主機有 artisan 的目錄執行；不是由本次程式編輯自動執行：

```bash
php artisan migrate --path=database/migrations/2026_10_20_000000_add_payment_methods_to_checkout.php --force
php artisan config:clear
php artisan config:cache
```

此 migration 依賴原 checkout_orders / tappay_payment_attempts 表已存在；既有訂單與交易預設補為 card，不改金額或交易狀態。應在對外恢復新版本服務前完成 migration 與設定更新。不要在已有新付款方式交易後任意 rollback，以免移除繳費資料。

## API 契約

所有買家端 API 沿用 Sanctum 與 CSRF，金額及商家只由後端決定。

### 付款設定

`GET /api/v1/payments/tappay/config` 保留 App ID/App Key、environment、three_domain_secure，新增 `method_settings`，各方式回傳 enabled、ready、missing、min_amount、max_amount。`methods` 只列出設定完成且啟用的方式；整體 ready 表示至少一種方式可用。請以前端選中方式的 ready 判斷，不能把整體 ready 當成每種方式都可用。缺少 LINE Pay 或 ATM 設定不會讓原本信用卡失效。

### 建立訂單

`POST /api/v1/checkout/orders` 原本 items、contact、idempotency_key 不變，新增：

```json
{"payment_method":"line_pay"}
```

可填 card、line_pay、atm，未填預設 card。付款方式固定在訂單，不接受在付款時切換；同一 idempotency_key 更換方式會回 409。舊信用卡請求的雜湊保留相容性。ATM 含運費總額須為整數 TWD 16–49,999；其餘保留現有上限。建立訂單不會直接向 TapPay 付款或取號。

### 發起付款／取得虛擬帳號

`POST /api/v1/checkout/orders/{id}/pay`：

```json
{"prime":"對應付款方式的SDK所產生的一次性prime"}
```

可選填 payment_method，但若與訂單不同會拒絕。不可傳 Merchant ID、金額、帳號或自行指定回呼網址。各方式使用各自的 prime：信用卡 Fields、`TPDirect.linePay.getPrime()`、`TPDirect.virtualAccount.getPrime()`；不能共用信用卡 prime。ATM Web SDK 請沿用 5.19.2 或更新相容版本。

- LINE Pay：後端選擇 LINE Pay 專用商家，提供返回與通知網址，不套用信用卡 three_domain_secure；回傳 `payment.payment_url` 後由前端導向 LINE Pay，再返回原訂單查詢。前端不要將此按鈕標為銀行 3D 驗證。
- ATM：後端選擇 ATM 商家，提供通知網址及 expire_in_days；不發送信用卡 3D 參數。取得帳號後仍是 pending，`can_pay=false`，避免重複取號或換方式再收一次款。

新增回應欄位：

```json
{
  "data": {
    "payment_method": "atm",
    "payment_status": "pending",
    "can_pay": false,
    "payment": {
      "payment_method": "atm",
      "payee_info": {
        "vacc_bank_code": "金融機構代碼",
        "vacc_no": "虛擬帳號（字串，保留前導零）",
        "expire_time": "YYYY-MM-DD HH:mm:ss"
      },
      "payment_expires_at": "帶時區的ISO時間",
      "can_transfer": true
    }
  }
}
```

payee_info 加密保存，僅透過原本訂單擁有者驗證的 API 回傳三個繳費欄位，不保存付款人帳號末碼。台灣 ATM 回傳的無時區期限以 Asia/Taipei 解析並轉 UTC 保存；前端以 payment_expires_at 顯示台灣時間。繳費資訊不完整時不顯示可轉帳，後續可透過 refresh 從 payee_info 恢復資料。取得有效銀行期限後會同步原訂單 expires_at；尚未取號前仍須在建單後 24 小時內發起。

前端不可只依 can_pay=false 顯示「不能付款」；ATM 已取號時應改顯示帳號及繳費期限。can_transfer=false 或期限到期時停止引導轉帳，但不自行改成失敗、也不產生新帳號。收到延遲通知仍會查帳，不能因本地付款期限已過而忽略已入帳紀錄。

### 查詢及通知

`GET /checkout/orders/{id}` 讀取已保存狀態；`POST /checkout/orders/{id}/refresh` 查詢 TapPay Record API。回呼仍使用原本 `/payments/tappay/notify`、每次交易獨立的 token 雜湊與服務端查帳，不能依通知內容或前端返回參數直接標為 paid。

查帳核對原交易 merchant_id、銀行訂單編號、rec_trade_id、原始金額、幣別與 payment_method（direct_pay / line_pay / atm）。保留 status=2 仍處理附帶紀錄的修正。ATM record_status=1 才代表入帳完成；取得虛擬帳號、API status=0 都不是已付款。舊交易在停用某一方式或更改該方式 Merchant ID 後，仍以保存的原交易 Merchant ID 查帳；需保持總開關及原 Partner Key 可用。

## 限制與測試交接

- 未新增付款成功的模擬按鈕或公開模擬入帳 API。ATM 測試帳號不是用來真實匯款；Sandbox 入帳模擬請依官方文件 4.6 Simulated Payment，由操作人員自行執行，後端再由通知或 refresh 確認結果。
- 信用卡既有前端維持相容；LINE Pay 按鈕、ATM 選項及帳號顯示仍待下一階段前端串接。
- 未實作庫存預留／扣減、付款後清空購物車、退款、物流、分潤或定期查帳排程。通知失敗時可在原訂單 refresh。正式環境仍拒絕使用。
- 不自動重送付款；未知或待付款交易會阻擋再次付款與跨方式切換。只有經查帳確認失敗／取消且未逾期，才能在原訂單使用同方式與新的 prime 再試。

官方規格：

- [LINE Pay 後端](https://docs.tappaysdk.com/line-pay/zh/back.html)
- [LINE Pay Web](https://docs.tappaysdk.com/line-pay/zh/front.html)
- [ATM 虛擬帳號產品文件](https://www.tappaysdk.com/documents/developer/TapPay%20Developer%20Document%20-%20ATM.pdf)
- [ATM Web SDK 範例](https://tappay.github.io/tappay-web-example/Virtual_Account/)
