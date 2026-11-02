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
- 不提供追蹤者個資列表、不實作通知、付費訂閱、打賞或收藏頁串接。

## API 行為摘要

以下均需 Sanctum 登入；身分只取自登入會員，不接受前端指定 user_id。

- `GET /api/v1/creators/{id}/follow`：讀取目前會員追蹤狀態。
- `PUT /api/v1/creators/{id}/follow`：追蹤（不需要 body）。
- `DELETE /api/v1/creators/{id}/follow`：取消追蹤（不需要 body）。

成功回應 data：creatorId、isFollowing、canFollow、followers。取消隱藏創作者時 followers=null、canFollow=false。
重複 PUT／DELETE 仍回成功並保持目標狀態，不是 toggle。前端結果不明時可重送相同方法或 GET 查詢。
每次操作在 transaction 內依序鎖會員與創作者，配合唯一約束避免並行重複。
未登入回401；不存在／非公開查詢與新增回404；追蹤自己回422；超過限流回429。
公開介紹 capabilities.follow=true，個人是否可以追蹤則以登入狀態 API 的 canFollow 為準。

## 部署

上傳程式後，在後端根目錄執行：

```sh
php artisan migrate --force
php artisan optimize:clear
```

必須完成 migration 才能使用新增 API 與公開人數查詢。本次未執行 migration、測試或 build。
前端尚未修改，下一步恢復創作者頁按鈕樣式並串接追蹤；探索頁類別恢復原本固定的藝術風格分類。
