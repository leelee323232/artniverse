# 貼文按讚：ER 調整與部署

## 資料表

新增 `post_likes`，migration：`2026_11_04_000000_create_post_likes_table.php`。

| 欄位 | 說明 |
| --- | --- |
| id | bigint 主鍵 |
| user_id | users.id 外鍵，會員實體刪除時 cascade |
| post_id | posts.id 外鍵，貼文實體刪除時 cascade |
| created_at | 首次按讚時間；重複 PUT 不更新時間 |

`(user_id, post_id)` 唯一；另建 post_id 索引供讚數統計。官方與創作者共用此表，不匯入展示假資料、不新增可失真的總數欄位。取消後再按讚會建立新紀錄。

## 行為

- `GET /api/v1/posts` 的 likes 改為真實關聯 COUNT，列表一併查詢，不逐筆發出計數查詢。管理員貼文列表與詳細資料也顯示真實讚數。
- 公開列表的 `isLiked=false` 保留為未載入會員狀態的預設值，**登入後不可用它覆蓋會員狀態**，前端應批次讀取以下 API。公開 capabilities.like=true 代表提供按讚功能，個人可否操作依登入與 canLike 判斷。管理後台的操作列維持本階段僅提供刪除。
- PublicPostQuery 統一首頁及按讚的公開條件：貼文未軟刪除，官方貼文 creator_id=null；創作者貼文的作者須符合現有 PublicCreatorQuery 公開資格。
- 任一登入會員皆可對公開貼文按讚，包含自己的貼文。每位會員每篇只能有一個讚，重送 PUT／DELETE 保持指定狀態，不使用 toggle。
- 寫入 transaction 依序鎖會員、貼文，與後台刪除貼文順序相同；唯一約束避免重複關聯。不修改貼文 version，避免按讚造成內容版本衝突。
- 下架作者或軟刪除貼文會保留歷史讚，但禁止新增。會員仍可取消自己的讚；未公開貼文不回傳讚數。實體刪除貼文／會員時關聯由外鍵清除。

## API 摘要

以下皆要求 Sanctum 登入，身分取自登入會員，不接受前端指定其他會員。

- `GET /api/v1/posts/like-statuses?post_ids[]=1&post_ids[]=2`：整頁批次查詢，最多 100 個不同正整數 ID。
- `GET /api/v1/posts/{id}/like`：查詢單篇公開貼文的按讚狀態。
- `PUT /api/v1/posts/{id}/like`：按讚，不需 body。
- `DELETE /api/v1/posts/{id}/like`：取消按讚，不需 body。

單篇回應 `data: { postId: string, isLiked: boolean, canLike: boolean, likes: number | null }`。
批次 data 為同格式陣列，依輸入順序回應。不存在或不公開的 ID 回 canLike=false、likes=null，只保留目前會員自己的關聯狀態，不洩漏隱藏貼文資訊。

單篇 GET／PUT 未公開或不存在回 404；DELETE 不存在回 404、軟刪除仍可取消；未登入 401、輸入錯誤 422、限流 429。查詢每分鐘 60 次，寫入另限每分鐘 30 次。會員 API 回應 private, no-store。

前端只替真實資料庫 ID 呼叫 API；展示假資料留在前端。操作回應不明時先重新查詢或重送相同方法，避免用舊狀態反轉。登入者狀態不可存為跨會員共用快取。

## 部署

上傳程式後，在後端根目錄執行：

```sh
php artisan migrate --force
php artisan optimize:clear
```

必須建立 post_likes 才能使用新的首頁／後台讚數查詢。既有 posts migration 保持不變。本次未執行 migration、測試或 build；前端按讚串接待切回前端處理。
