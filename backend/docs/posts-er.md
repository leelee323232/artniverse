# 貼文共用資料表與部署

## 範圍

2026-11-04 更新：按讚改用共用 `post_likes` 關聯表及真實讚數，詳見 [post-likes-er.md](post-likes-er.md)。下方原始階段的互動限制中，按讚已另行開放；留言、收藏尚未實作。

官方及創作者共用 `posts`，不建立 `official_posts`。`admin/posts/` 本次只發佈、列出及刪除官方貼文；創作者從自己的發文入口發佈，該入口尚未實作。首頁公開 API 已支援合併讀取兩種貼文。既有前端展示資料不自動匯入資料庫。

## ER 調整

Migration：`2026_11_03_000000_create_posts_table.php`。

| 欄位 | 用途 |
| --- | --- |
| id | bigint 主鍵 |
| author_type | official / creator，區分顯示作者及發文來源 |
| creator_id | nullable，關聯 creators.id；官方為 null，創作者發佈時必須有值 |
| created_by | 實際操作的 users.id，與顯示作者分開；刪除會員時設 null |
| content | 貼文內文，共用欄位；本次 API 限 500 字且不可空白 |
| images | JSON 有序陣列，每筆為 R2 path、url；無圖為 [] |
| request_key | 64 字元 SHA-256，唯一；依發文來源、操作會員及 requestKey 隔離 |
| request_hash | 64 字元 SHA-256，驗證重送內容一致 |
| version | 版本號，初始 1，刪除遞增 |
| deleted_by | 刪除操作的 users.id，刪除會員時設 null |
| deleted_at | 軟刪除時間 |
| created_at / updated_at | 建立／異動時間 |

索引：`(deleted_at, created_at, id)`、`(author_type, deleted_at, created_at)`，以及外鍵及 request_key 唯一索引。

`creator_id` 的外鍵採 nullOnDelete，保留歷史貼文；author_type 仍為 creator，不能把失去作者的貼文轉成官方貼文。首頁只顯示官方且 creator_id=null 的貼文，或作者仍符合 PublicCreatorQuery 公開條件的創作者貼文，並排除軟刪除。

未來創作者發文 API 必須從登入會員取得其 creator_id，驗證作者資格，不接受任意指定他人的 creator_id。需使用相同 images 格式及發佈防重機制；與官方入口共用此表，不另建創作者貼文表。按讚、留言、收藏的關聯表本次未建立，回應的零值及空陣列代表功能尚未開放。

## 已完成行為

- `GET /api/v1/posts`：公開首頁列表，合併兩種作者，最新時間／ID 優先，分頁預設 20、最多 100。
- `GET /api/v1/admin/posts`：管理員官方貼文列表，同樣支援 page、per_page。
- `GET /api/v1/admin/posts/{id}`：官方貼文詳細資料。
- `POST /api/v1/admin/posts/images`：管理員上傳單張 image 至 R2，沿用現有上傳服務；jpg/jpeg/png/webp/gif、每張最多 5 MB、長寬最多 10000，排除 SVG。回應 data.path、data.url 等資訊。
- `POST /api/v1/admin/posts`：content、requestKey（UUID）、imagePaths（可省略，最多 10 張）。只接受目前帳號上傳且仍存在 R2 的路徑，拒絕 authorType、creatorId、authorId。固定寫入 official；首次成功 201，同內容同識別碼重送 200，不重複發佈；識別碼改用不同內容或貼文已刪除回 409。
- `DELETE /api/v1/admin/posts/{id}`：帶 expectedVersion；版本衝突 409；軟刪除，同一貼文重複刪除回成功。不實體刪除 R2 圖片，避免影響共用圖片的其他內容。

管理端全部要求 Sanctum 登入及 is_admin，非管理員 403。公開回應不含操作會員、R2 path、request_key/hash；官方作者為 ARTNIVERSE，authorId 為空，避免連到管理員私人主頁。創作者 authorId 是 creators.id，前端應連到 `/creator/?id=...`。

圖片沿用現有 R2 環境設定。選檔尚未發佈就取消時，已上傳圖片可能暫留 R2，本次不自動清除物件。前端首頁及後台串接尚待下一階段處理。

## 部署

上傳所有異動及新增檔案後，在後端根目錄執行：

```sh
php artisan migrate --force
php artisan optimize:clear
```

本次 migration 尚未執行，原先未完成的 create_official_posts_table migration 已改名及改內容，不應同時部署兩份。本次未執行本地測試、build 或 migration。
