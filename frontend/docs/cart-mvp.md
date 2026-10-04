# 購物車 MVP 與後續結帳銜接

## 本次範圍

商品卡片／內頁 → 購物車各組底下直接前往結帳 → 收件資料／付款方式 → 建立示範訂單 → 模擬付款成功／失敗／重試。已移除單組確認視窗。尚未串接 API、正式金流、登入銜接與優惠碼；會員訂單頁交由另一位夥伴處理。

- 同創作者、同類型的一般／預售商品分別成組；競標每件獨立成組。
- 預售未開始、達標、截止時不能加入或確認。付款期限從「建立訂單」起算 24 小時；加入購物車不開始計時。
- 競標傳入示範得標資料（成交價、順位、付款截止），固定數量 1。首次加入後保留期限；移除、重加、重整不重設期限。
- 三種類型均可用優惠碼；實際套用是 CHECKOUT-01 的後續工作。
- 每組示範運費沿用 NT$ 80，商品小計滿 NT$ 1,000 免運；這不是新增正式物流設定。

## 共用入口

- `lib/commerce/cart.ts`：資料格式、購買限制、分組、儲存資料檢查、運費。
- `lib/commerce/cart-context.tsx`：`useCart()` 提供 `addItem`、`setQuantity`、`removeItem`、`items`、`awards`、`ready`。
- `addItem(productId, quantity, award?)` 回傳 `{ ok, message }`；普通商品資料由 catalog 查詢。
- `CartLine` 保留商品 ID／數量及競標得標快照。普通商品金額取目前 catalog，不把本機保存的普通商品價格當真。
- `cartGroupId(product)` 是後續結帳的分組入口。確認時必須再次檢查該組所有商品。
- 本機 key：`artniverse_cart_v1`。目前是同一瀏覽器的前端示範購物車，非會員同步資料。

## 串接注意

目前競標使用固定示範會員，localStorage 的得標資料不是資格證明。API 分支須以後端得標者、成交價、期限覆核，不能直接信任本機資料。
目前 mock 商品的時間是相對載入時間產生；已加入的競標期限另外保存。正式 API 應提供穩定的商品／競標場次 ID 與絕對時間，重新開拍須以新的場次識別。
結帳建立訂單成功後，只移除本次下單數量；其他組保留。付款重試更新同一筆訂單，不重建訂單、不重設期限。一般／預售訂單暫統一採下單起算 24 小時；競標沿用得標期限。

新增 `lib/commerce/orders.ts` 提供 `CheckoutOrder`、`readOrders`、`saveNewOrder`、`payOrder`。本機 key 為 `artniverse_orders_v1`，會員訂單頁可透過此共用入口串接前端示範訂單。這是此裝置的示範資料，尚未按會員隔離。送單以 draftId 避免重複；已有訂單的競標不能再次建立訂單。
結帳網址 `/checkout?group=...&draft=...`；付款網址 `/checkout/payment?order=...`。已移除此裝置的示範訂單列表及所有入口；省略 order 時導向 /account/orders。會員訂單資料串接由夥伴後續完成；保留帶 order 的單筆付款頁供下單與接續付款使用。表單暫存於 sessionStorage，成功下單後清除。

## 驗證

在 frontend 執行：`node --test tests/cart.test.cjs`。
16 項測試涵蓋合併庫存、無效數量、預售時間邊界／達標、候補成交價、競標逾期、移除重加、損壞儲存資料、分組與免運門檻。

已操作驗證一般商品加入與重整保留、預售加入／達標停用、競標加入與單組確認；使用既有本機開發站。
全專案 `tsc --noEmit --incremental false` 仍受原有登入頁、calendar／chart 等錯誤阻擋；本次修改檔案沒有 TypeScript diagnostics。原始 HEAD 的檢查也出現上述錯誤。

## Notion

計畫：https://app.notion.com/p/3ec25c8a48d581c293aecc30f9cc3c1e
CART-01～05 已完成；CHECKOUT-02 已完成示範結帳主流程，登入銜接仍待辦；CHECKOUT-03 已完成模擬付款。CHECKOUT-01 優惠碼仍待辦。
