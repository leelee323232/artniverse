# 創作者申請與審核後端（2026-11-01）

## 部署

本次僅修改後端；未執行 migration、測試、build、資料庫連線或實際上傳。
上傳本次所有後端檔案（包含 resources/contracts）後，在後端根目錄執行：

```bash
php artisan migrate --force
php artisan config:cache
php artisan route:clear
```

預設 `CREATOR_DOCUMENT_DISK=creator_documents`，證件儲存在
`storage/app/creator-documents`，須可寫入並納入私有備份，勿建立公開 symlink。
一般商品圖與頭像仍沿用原本 R2 設定。本功能不需要修改公開 art-image。

若證件要放 Cloudflare，另建私有 Bucket，關閉 Public Development URL、Custom Domains
及其他公開存取方式。不要使用 art-image。設定：

```dotenv
CREATOR_DOCUMENT_DISK=r2_private
R2_PRIVATE_ACCESS_KEY_ID=私有桶憑證
R2_PRIVATE_SECRET_ACCESS_KEY=私有桶密鑰
R2_PRIVATE_BUCKET=獨立的私有桶名稱
R2_PRIVATE_ENDPOINT=https://帳號ID.r2.cloudflarestorage.com
```

憑證需具有該私有桶 Object Read & Write 權限；本機與 R2 切換後，歷史申請會依
document_disk 繼續從原本位置讀取，勿移除舊儲存空間。程式不會自動搬移檔案。
R2 需已有 `league/flysystem-aws-s3-v3` 套件。PHP upload_max_filesize 至少 5M、
post_max_size 建議 16M（兩張照片各 5 MiB 加上文字）；反向代理上傳限制亦需足夠。

管理員必須由受信任的部署／DBA 流程指定 users.is_admin=true。
預設所有會員為 false，不提供自助升權接口。需以實際管理員帳號 ID 設定，勿批次授權。

## ER / DBA 調整

- users.is_admin boolean default false；creators.user_id nullable、unique、外鍵 users.id。
- 建立 ER 已定義但尚無 migration 的 creator_applications 基本欄位。
- id_front_image / id_back_image 改存私有 object key，而非公開網址。
- 新增 document_disk、contract_version、contract_hash、contract_snapshot、consented_at。
- 新增 request_key、request_hash，(user_id, request_key) unique，支援重送去重。
- 新增 reviewed_by（可空 users 外鍵）、reviewed_at、version；保留 review_note。
- 新增 creator_application_reviews：application_id、reviewer_id、from_status、to_status、reason、created_at。
- 銀行帳號以字串存放，僅本人及管理員詳細資料可取得；此版本尚未加入欄位加密。

Migration 遇到已存在欄位／資料表不刪除，會核對既有申請表必要欄位；缺少時停止，
由 DBA 核對 ER 後再跑。既有主外鍵須為相容型別，既有 creators.user_id 不得重複。
舊申請缺少合約快照或私有證件時不能直接核准；需補正流程／重新送件，
不自動把舊公開證件網址下載回私有空間。Migration down 刻意拒絕刪除歷史敏感資料，
需 DBA 審閱後處理回滾。

