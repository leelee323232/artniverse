# 商品收藏：ER 調整與部署

商店商品卡牌、商品詳細頁愛心及會員收藏頁共用 `product_favorites`。與 `creator_follows` 分開；收藏商品不代表追蹤創作者，不影響購物車、訂單或庫存。

## 新增資料表

Migration：`2026_11_03_010000_create_product_favorites_table.php`。

| 欄位 | 說明 |
| --- | --- |
| id | bigint 主鍵 |
| user_id | users.id 外鍵，會員實體刪除時 cascade |
| product_id | products.id 外鍵，商品實體刪除時 cascade |
| created_at | 首次收藏時間，重複 PUT 不改時間；取消再收藏建立新紀錄 |

唯一約束 `(user_id, product_id)`；另有 `product_id` 與 `(user_id, created_at)` 索引。不匯入示範資料，不新增商品收藏總數欄位。

## 行為

- 所有端點皆需 Sanctum 登入，會員 ID 只來自登入身分。
- 可收藏條件與現有公開 ProductController 相同：is_active=true、deleted_at=null。所有資料庫商品類型沿用相同關係；售完仍可收藏，不保留庫存。
- 下架／封存商品不在清單及總數中，原關聯保留，重新上架後再次顯示；仍可取消收藏。
- PUT／DELETE 是指定收藏狀態，不是 toggle，重複呼叫不重複建立關係。交易依序鎖會員及商品，搭配唯一約束處理並行。
- 批次狀態只回目前會員自己的收藏狀態；不存在／下架商品 canFavorite=false，不回傳隱藏商品內容。
- 公開商品 API 不新增個人收藏狀態。前端展示 ID 不得呼叫正式收藏寫入 API，尤其不能把展示用數字 ID 當成資料庫商品 ID。

## API 摘要

- `GET /api/v1/me/favorite-products`：收藏中的公開商品，接受 search（最多 100 字，商品名稱、分類、創作者名稱）、page、per_page（預設 20、最多 100）。按收藏時間降冪，再以商品 ID 降冪穩定排序。data 沿用 PublicProductData 格式，包含規格與圖片，額外帶 isFavorited=true、canFavorite=true；meta 為 current_page、last_page、per_page、total（搜尋後數量）、totalFavorites（未搜尋的公開收藏數）。
- `GET /api/v1/product/favorite-statuses?product_ids[]=1&product_ids[]=2`：一次最多 100 個不同的正整數 ID，data 陣列順序與輸入相同。
- `GET /api/v1/product/{id}/favorite`：單筆收藏狀態；未公開或不存在回 404。
- `PUT /api/v1/product/{id}/favorite`：加入收藏，不需 body；未公開或不存在回 404。
- `DELETE /api/v1/product/{id}/favorite`：取消收藏，不需 body；商品不存在回 404，已下架／封存仍可取消。

狀態回應格式：`data: { productId: string, isFavorited: boolean, canFavorite: boolean }`。批次的 data 為相同格式陣列。

未登入 401、輸入錯誤 422、限流 429。全部回應 `Cache-Control: private, no-store`；每分鐘 60 次，寫入另限每分鐘 30 次。前端結果不明時應重新查詢狀態，或重送相同 PUT／DELETE，不用舊狀態盲目反轉。

## 部署

上傳本次程式及 migration，在後端根目錄執行：

```sh
php artisan migrate --force
php artisan optimize:clear
```

本次未執行 migration、測試或 build。前端串接待切回前端處理。
