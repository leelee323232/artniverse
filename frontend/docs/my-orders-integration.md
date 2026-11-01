# 我的訂單前端交接

## 本版變更

- `/account/orders/` 改用 `GET /api/v1/orders`，移除固定 mockOrders。每頁 20 筆，支援付款方式與付款狀態篩選，切換條件回第一頁。
- `/account/orders/detail?id=UUID` 改用 `GET /api/v1/orders/{UUID}`。顯示訂購商品快照、下單時間、金額、收件資料、付款狀態、交易識別碼及 ATM 帳號與期限。
- 保留 loading、未登入、空列表、API 錯誤、404 與 429 狀態。切換登入者或訂單時重建元件並中止舊請求，不將訂單或地址存入 localStorage。
- 列表與明細初次載入只讀取後端已保存資料。明細「查詢付款狀態」才會呼叫既有 refresh API，沿用 CSRF。沒有逐筆輪詢。429 依 Retry-After 等候，成功查詢後間隔 5 秒。
- 「前往付款／開啟付款紀錄」導向原 UUID 的 `/checkout/payment?source=api&order=UUID`，不建立新訂單。查帳結果不明時暫停顯示此入口，須成功查詢後繼續。
- 後端未提供商品圖片快照、規格及創作者名稱，訂單頁以商品名稱、創作者編號、原始單價及數量顯示，不拿目前商品價格覆蓋歷史訂單。
- 付款成功不等同已出貨；移除示範運送中／已送達狀態及無實作的追蹤、評價操作。原有本機模擬購物流程不混入真實訂單列表。

## TapPay 微調

只在 `components/checkout/api-payment.tsx` 增加「查看訂單明細」與「我的訂單」連結，按鈕列可換行。沿用使用者補回的信用卡、LINE Pay、ATM 付款元件、SDK、商家設定、prime 取得、付款請求、跳轉與查帳流程；本版未改動這些付款邏輯。

## 部署依賴

後端需已部署上一版 orders 列表與明細 API，並清除舊路由快取。前端沿用 NEXT_PUBLIC_API_URL，不需新增環境變數。測試訂單仍顯示 Sandbox 提示，ATM 測試帳號不可真實轉帳。

本版僅編寫程式，未執行測試、型別檢查、建置、API 請求或付款。使用者自行建置及驗證。

## 商品部分：僅記錄，未修改

目前讀到的來源有以下銜接點，待切回後端商品工作時處理：

1. `app/shop/page.tsx` 同時使用商品 API 與 mockProducts / mockProductCategories；需確認哪些區塊仍顯示假資料，將列表、分類與數量統一使用同一資料來源。
2. `app/product/product-detail.tsx` 仍含固定 productDetails 與 mockProducts；需按列表點入的真實 product_id 取得單筆商品，避免列表與明細名稱、價格、庫存不同。
3. `components/product-card.tsx` 還會依 ID 查 mockProducts，購買資格應改以真實商品資料判斷，不能依巧合同 ID 的假商品決定可否購買。
4. `lib/products-api.ts` 已有 images、categoryId、creatorId、productType、price、stock 等預期欄位；後端需對齊欄位命名、ID 型別、圖片格式、上下架狀態及錯誤回應，詳細頁應處理不存在／已下架商品。
5. 加入購物車須沿用資料庫商品 API，商品明細的規格選項如會影響價格／庫存，需先設計 variant ID 與後端驗證，再接到購物車及訂單快照。現有金流建單只支援一般商品，競標／預售不能直接沿用一般商品付款。

上述商品檔案本版皆未修改，也未切換 Git 分支。
