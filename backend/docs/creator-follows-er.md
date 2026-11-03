# 創作者追蹤：ER 調整與部署

新增 `creator_follows`，migration 為 `2026_11_02_020000_create_creator_follows_table.php`。

| 欄位 | 說明 |
| --- | --- |
| id | bigint 主鍵 |
| user_id | users.id 外鍵，刪除會員時連動刪除 |
| creator_id | creators.id 外鍵，刪除創作者時連動刪除；另設查詢索引 |
| created_at | 首次追蹤時間 |

`(user_id, creator_id)` 唯一，禁止同一會員重複追蹤。取消後重新追蹤會建立新紀錄。

## 人數與公開性

- 公開創作者介紹、探索列表及追蹤最多排序統一使用關聯紀錄的 COUNT，不使用舊 creators.followers 數值。
- 舊欄位及數值保留，不自動製造會員追蹤紀錄，也不匯入假資料。部署後沒有真實追蹤紀錄的創作者顯示 0。前端示範卡片可繼續保留原本示範數字。
- 創作者需公開且關聯會員仍有創作者身分才能新增追蹤。未綁定會員的既有公開創作者仍可被追蹤。
- 不能追蹤自己；創作者下架後仍允許會員取消自己的追蹤，不回傳該創作者的隱藏資料或人數。
- 會員／創作者刪除後外鍵清理關聯，人數由關聯計算，不需另行修正快取數字。
- 不提供追蹤者個資列表、不實作通知、付費訂閱或打賞。收藏頁的創作者與探索卡牌愛心共用此追蹤關聯，不另建收藏表。

## API 行為摘要

以下均需 Sanctum 登入；身分只取自登入會員，不接受前端指定 user_id。

- `GET /api/v1/creators/{id}/follow`：讀取目前會員追蹤狀態。
- `PUT /api/v1/creators/{id}/follow`：追蹤（不需要 body）。
- `DELETE /api/v1/creators/{id}/follow`：取消追蹤（不需要 body）。
- `GET /api/v1/me/followed-creators`：登入會員追蹤中的公開創作者清單。
- `GET /api/v1/creators/follow-statuses?creator_ids[]=1&creator_ids[]=2`：批次讀取卡牌追蹤狀態，最多 100 個不同的正整數 ID；不接受示範 ID。

成功回應 data：creatorId、isFollowing、canFollow、followers。取消隱藏創作者時 followers=null、canFollow=false。
重複 PUT／DELETE 仍回成功並保持目標狀態，不是 toggle。前端結果不明時可重送相同方法或 GET 查詢。
每次操作在 transaction 內依序鎖會員與創作者，配合唯一約束避免並行重複。
未登入回401；不存在／非公開查詢與新增回404；追蹤自己回422；超過限流回429。
公開介紹 capabilities.follow=true，個人是否可以追蹤則以登入狀態 API 的 canFollow 為準。

### 探索愛心與收藏頁（2026-11-03）

- 本次沒有 ER 或 migration 異動，沿用 `creator_follows`；不建立商品收藏功能，也不寫入示範資料。
- 清單接受 `search`（最多 100 字，搜尋星球名稱、品牌名稱、標籤）、`page`（預設 1）、`per_page`（預設 20，最多 100）。按最新追蹤時間排序，再以創作者 ID 降冪穩定排序。
- 清單 `data` 沿用探索卡牌欄位並加入 `isFollowing: true`；`meta` 包含 `current_page`、`last_page`、`per_page`、`total`（搜尋後總數）、`totalFollowing`（未搜尋的公開追蹤總數）。沒有追蹤時回空陣列。
- 下架或失去創作者身分的資料不出現在收藏清單，也不計入上述總數；原追蹤關聯保留，重新公開後會再次顯示。
- 批次狀態的 `data` 為陣列，每筆包含 `creatorId`、`isFollowing`、`canFollow`、`followers`，與單筆狀態格式一致。順序與輸入一致；不存在或未公開的 ID 回 `canFollow: false`、`followers: null`，僅保留會員自己的追蹤狀態，不洩漏隱藏資料。自己的創作者頁不可新增追蹤。
- 兩支新增查詢均需登入，限流每分鐘 60 次，回應 `Cache-Control: private, no-store`；驗證錯誤回 422。公開探索 API 不混入會員狀態。
- 之後前端應先取得公開卡牌，再批次查詢這一頁的狀態；愛心操作沿用 PUT／DELETE，成功後更新狀態及人數。取消追蹤後重新查詢收藏清單與總數；示範卡片須分開處理，不能以相同數字 ID 呼叫正式 API。

## 部署

上傳程式後，在後端根目錄執行：

```sh
php artisan migrate --force
php artisan optimize:clear
```

必須完成 migration 才能使用新增 API 與公開人數查詢。本次未執行 migration、測試或 build。
若先前追蹤 migration 已完成，本次只需上傳程式並執行 `php artisan optimize:clear`。本次探索愛心與收藏頁的前端串接尚未修改，待切回前端處理。
