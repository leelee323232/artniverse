# Explore 創作者：ER 調整與部署

## 新增欄位

Migration：`2026_11_02_010000_add_creator_explore_fields.php`。

| creators 欄位 | 型別／預設 | 用途 |
| --- | --- | --- |
| planet_name | nullable varchar(255) | 星球展示名稱；空值沿用品牌名稱 name |
| avatar_url | nullable text | 公開 HTTPS 圖片網址，可填 R2 公開網址；沒有圖片回傳 null |
| is_active | boolean，預設 true | 是否公開顯示；false 即從列表、標籤及單筆查詢移除 |

只補缺少的欄位，不覆蓋既有值，不建立假資料。舊資料與新核准的創作者預設公開；既有資料若不應公開，DBA 應將 is_active 設為 false。
此 migration 依賴先前創作者申請 migration 的 creators.user_id，部署請執行所有待執行 migrations。

## 資料來源及範圍

- 審核通過流程已建立 creators.name（品牌名稱）、description（創作理念）、tags（申請選擇的合作產品類別）。因此目前標籤可能是商品類別，不一定是前端假資料中的藝術風格；本次不自行推測或改寫標籤。
- 已有 creators 紀錄、is_active=true，且綁定會員仍有 is_creator 身分，才公開。舊有未綁定會員的 creators 紀錄依 is_active 決定公開與否。
- 不讀取／回傳申請人真實姓名、email、電話、地址、銀行帳號、證件或合約；也不回傳 user_id。
- followers、rating、total_reviews 沿用目前儲存值。本次沒有追蹤、收藏或評分寫入功能，也沒有新增圖片上傳或創作者設定頁。
- 不新增星球、圖片假內容；色碼未設定或格式不符時提供預設展示色。
- 後台管理這三項新欄位的 UI 尚未串接，目前由 DBA 維護。

## 本次公開端點

- `GET /api/v1/creators`：search、tag、sort=rating|followers|newest、page、per_page（預設20，上限100）。搜尋品牌名稱、星球名稱、簡介及標籤，不搜尋商品／作品內容。
- `GET /api/v1/creators/tags`：目前公開創作者實際使用的標籤。選擇「全部」時不傳 tag。
- `GET /api/v1/creators/{id}`：同一份公開卡片資料，不含商品或創作者完整個人頁資料。
- 列表回傳 data 與 meta；meta.total 是篩選結果總數，meta.totalCreators 是公開創作者總數。排序同值以 ID 降序穩定分頁。
- 可未登入讀取，限流每分鐘60次。無結果回空陣列；下架或不存在的單筆回404；參數不符回422。

## 部署

於後端根目錄：

```sh
php artisan migrate --force
php artisan optimize:clear
```

本次未執行 migration、測試或 build。前端尚未串接；原本 `/creator/1` 固定連結與靜態匯出路由須待前端階段處理，新增 API 本身不會改變網頁路由。
