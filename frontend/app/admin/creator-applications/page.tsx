"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  listCreatorApplications, getCreatorApplication, reviewCreatorApplication,
  getCreatorDocument, creatorReviewError,
  type ApplicationSummary, type ApplicationStatus, type CreatorApplication as Application,
} from "@/lib/admin-creator-applications-api";
import { Eye, Check, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const initialApplications: Application[] = [
  {
    id: "demo-2",
    version: 1,
    isDemo: true,
    date: "2026-06-19",
    status: "approved",
    email: "mei@example.com",
    realName: "中中",
    brandName: "Meme Lab",
    storePickup: "台北車站店",
    phone: "0923456789",
    birthday: "2004-12-25",
    address: "台北市中正區北平西路3號",
    bankCode: "013",
    bankAccount: "987654321098",
    selectedCategories: ["潮流", "公仔"],
    creativePhilosophy: "幽默拯救世界，迷因就是力量。",
    idFrontImage: "id_front.jpg",
    idBackImage: "id_back.jpg",
    agreeToContract: true,
  },
  {
    id: "demo-3",
    version: 1,
    isDemo: true,
    date: "2026-06-18",
    status: "rejected",
    rejectReason: "資料格式不正確",
    email: "howard@example.com",
    realName: "大大",
    brandName: "Space Flight",
    storePickup: "信義店",
    phone: "0934567890",
    birthday: "2003-04-01",
    address: "台北市信義區信義路五段7號",
    bankCode: "004",
    bankAccount: "554433221100",
    selectedCategories: ["科技", "模型"],
    creativePhilosophy: "將宇宙的奧秘，實體化呈現在桌面上。",
    idFrontImage: "front.jpg",
    idBackImage: "back.jpg",
    agreeToContract: true,
  },
];

export default function CreatorApplicationsPage() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <p role="status">確認登入中…</p>;
  if (!user) return <p>請先以管理員帳號<Link href="/login/" className="underline">登入</Link>。</p>;
  return <CreatorApplications key={user.id} />;
}

function IdentityDocument({ id, side, isDemo }: { id: string; side: "front" | "back"; isDemo?: boolean }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (isDemo) return;
    const controller = new AbortController();
    let objectUrl = "";
    setUrl(""); setError("");
    void getCreatorDocument(id, side, controller.signal).then(blob => {
      if (controller.signal.aborted) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    }).catch(err => { if (!controller.signal.aborted) setError(creatorReviewError(err)); });
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [id, side, isDemo, attempt]);
  if (isDemo) return <span>示範資料，無實際證件</span>;
  if (error) return <div role="alert">{error}<Button type="button" variant="outline" size="sm" onClick={() => setAttempt(value => value + 1)}>重試圖片</Button></div>;
  if (!url) return <span role="status">證件載入中…</span>;
  // Authenticated blobs remain in memory and are revoked when the dialog closes.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={side === "front" ? "身分證正面" : "身分證反面"} className="h-auto max-w-full rounded border" onError={() => setError("圖片無法顯示，請重試。")}/>;
}

function CreatorApplications() {
  const [applications, setApplications] =
    useState<ApplicationSummary[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [confirmType, setConfirmType] = useState<
    "approve" | "reject" | "re-evaluate" | null
  >(null);
  const [rejectInputReason, setRejectInputReason] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const active = useRef(true);
  const detailRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    active.current = true;
    return () => { active.current = false; detailRequest.current?.abort(); };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setListError(""); setApplications([]);
    void listCreatorApplications(page, controller.signal).then(result => {
      if (controller.signal.aborted) return;
      setApplications(result.data); setLastPage(result.meta.last_page); setTotal(result.meta.total);
    }).catch(err => { if (!controller.signal.aborted) setListError(creatorReviewError(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, reload]);

  const openApplication = async (app: ApplicationSummary) => {
    if (busy.current) return;
    detailRequest.current?.abort();
    setSelectedApp(null); setConfirmType(null); setRejectInputReason("");
    setDetailError(""); setReviewError(""); setNeedsRefresh(false);
    if (app.isDemo) {
      setDetailLoading(false);
      setSelectedApp(initialApplications.find(item => item.id === app.id) ?? null);
      return;
    }
    const controller = new AbortController();
    detailRequest.current = controller;
    setDetailLoading(true);
    try {
      const detail = await getCreatorApplication(app.id, controller.signal);
      if (!controller.signal.aborted) setSelectedApp(detail);
    } catch (err) {
      if (!controller.signal.aborted) setDetailError(creatorReviewError(err));
    } finally {
      if (!controller.signal.aborted) setDetailLoading(false);
    }
  };
  const closeApplication = () => {
    if (busy.current) return;
    detailRequest.current?.abort();
    setSelectedApp(null); setConfirmType(null); setReviewError(""); setDetailLoading(false);
  };

  const renderStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
            未審核
          </span>
        );
      case "approved":
        return (
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            審核通過
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-destructive/10 text-destructive border border-destructive/20">
            審核失敗
          </span>
        );
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: ApplicationStatus,
    reason?: string,
  ) => {
    if (busy.current || needsRefresh || !selectedApp || selectedApp.id !== id || selectedApp.isDemo) return;
    if (newStatus === "rejected" && !reason?.trim()) return;
    busy.current = true; setSaving(true); setReviewError("");
    try {
      const updated = await reviewCreatorApplication(selectedApp, newStatus, reason);
      if (!active.current) return;
      setSelectedApp(updated);
      setConfirmType(null); setRejectInputReason("");
      setReload(value => value + 1);
    } catch (err) {
      if (!active.current) return;
      setReviewError(creatorReviewError(err));
      setNeedsRefresh(true); setConfirmType(null);
    } finally {
      busy.current = false;
      if (active.current) setSaving(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="創作者申請審核管理"
        description="審核創作者申請資料與身分證明，管理申請狀態及退件原因。"
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button variant="outline" disabled={loading || saving} onClick={() => setReload(value => value + 1)}>重新載入</Button>
        {!loading && !listError && <span className="text-sm text-muted-foreground">正式申請共 {total} 筆；示範資料僅供查看，不會寫入資料庫。</span>}
      </div>
      {loading && <p role="status" className="mb-4">載入申請列表中…</p>}
      {listError && <p role="alert" className="mb-4 text-destructive">{listError} <Link href="/login/" className="underline">前往登入</Link></p>}
      {detailLoading && <p role="status" className="mb-4">載入詳細資料中…</p>}
      {detailError && <p role="alert" className="mb-4 text-destructive">{detailError} 請再次點選申請重試。</p>}
      {!loading && !listError && total === 0 && <p className="mb-4 text-muted-foreground">目前沒有正式申請，以下為保留的示範資料。</p>}

      {/* 列表表格：擴充顯示核心主要欄位 */}
      <div className="bg-background/80 backdrop-blur-lg rounded-xl border border-border/50 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/30 border-b border-border/50 text-muted-foreground text-sm font-semibold">
              <th className="p-4">真實姓名</th>
              <th className="p-4">品牌名稱</th>
              <th className="p-4">Email</th>
              <th className="p-4">聯絡電話</th>
              <th className="p-4">已選分類</th>
              <th className="p-4">申請日期</th>
              <th className="p-4">狀態</th>
              <th className="p-4 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {(!loading && !listError ? [...applications, ...(page === 1 ? initialApplications : [])] : []).map((app) => (
              <tr
                key={app.id}
                onClick={() => void openApplication(app)}
                className="border-b border-border/40 hover:bg-muted/40 cursor-pointer transition-colors text-muted-foreground hover:text-foreground text-sm"
              >
                <td className="p-4 font-medium text-foreground">
                  {app.realName}{app.isDemo && <span className="ml-2 text-xs text-muted-foreground">示範</span>}
                </td>
                <td className="p-4">{app.brandName}</td>
                <td className="p-4">{app.email}</td>
                <td className="p-4">{app.phone}</td>
                <td className="p-4">{app.selectedCategories.join(", ")}</td>
                <td className="p-4">{app.date}</td>
                <td className="p-4">{renderStatusBadge(app.status)}</td>
                <td
                  className="p-4 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => void openApplication(app)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && !listError && <div className="my-4 flex items-center justify-end gap-3">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>上一頁</Button>
        <span className="text-sm">第 {page} / {lastPage} 頁</span>
        <Button variant="outline" disabled={page >= lastPage} onClick={() => setPage(value => value + 1)}>下一頁</Button>
      </div>}

      {/* 第一層：詳細資料視窗 Modal (此處修改為完整呈現 14 項欄位) */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40 p-4 animate-in fade-in duration-150">
          <div className="bg-background border border-border/80 rounded-xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-border/50 flex justify-between items-center bg-muted/20">
              <h3 className="text-lg font-bold text-foreground">
                創作者詳細申請資料
              </h3>
              <button
                disabled={saving}
                onClick={closeApplication}
                className="text-muted-foreground hover:text-foreground text-xl transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Content：完整呈現 JSON 規範的所有欄位 */}
            <div className="p-6 space-y-4 overflow-y-auto text-muted-foreground">
              <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                <span className="font-medium text-muted-foreground">
                  電子郵件
                </span>
                <span className="col-span-2 text-foreground">
                  {selectedApp.email}
                </span>
              </div>
              <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                <span className="font-medium text-muted-foreground">
                  真實姓名
                </span>
                <span className="col-span-2 font-semibold text-foreground">
                  {selectedApp.realName}
                </span>
              </div>
              <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                <span className="font-medium text-muted-foreground">
                  品牌名稱
                </span>
                <span className="col-span-2 font-semibold text-foreground">
                  {selectedApp.brandName}
                </span>
              </div>
              <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                <span className="font-medium text-muted-foreground">
                  取貨資訊
                </span>
                <span className="col-span-2 text-foreground">
                  {selectedApp.storePickup}
                </span>
              </div>
              <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                <span className="font-medium text-muted-foreground">
                  聯絡電話
                </span>
                <span className="col-span-2 text-foreground">
                  {selectedApp.phone}
                </span>
              </div>
              <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                <span className="font-medium text-muted-foreground">生日</span>
                <span className="col-span-2 text-foreground">
                  {selectedApp.birthday}
                </span>
              </div>
              <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                <span className="font-medium text-muted-foreground">
                  通訊地址
                </span>
                <span className="col-span-2 text-foreground">
                  {selectedApp.address}
                </span>
              </div>
              <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                <span className="font-medium text-muted-foreground">
                  銀行代碼
                </span>
                <span className="col-span-2 text-foreground">
                  {selectedApp.bankCode}
                </span>
              </div>
              <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                <span className="font-medium text-muted-foreground">
                  銀行帳號
                </span>
                <span className="col-span-2 text-foreground">
                  {selectedApp.bankAccount}
                </span>
              </div>
              <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                <span className="font-medium text-muted-foreground">
                  已選分類
                </span>
                <span className="col-span-2 text-foreground">
                  {selectedApp.selectedCategories.join(", ")}
                </span>
              </div>
              <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                <span className="font-medium text-muted-foreground">
                  創作理念
                </span>
                <span className="col-span-2 text-foreground whitespace-pre-wrap">
                  {selectedApp.creativePhilosophy}
                </span>
              </div>
              <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                <span className="font-medium text-muted-foreground">
                  身分證正面
                </span>
                <div className="col-span-2 text-foreground text-xs">
                  <IdentityDocument key={selectedApp.id + "-front"} id={selectedApp.id} side="front" isDemo={selectedApp.isDemo} />
                </div>
              </div>
              <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                <span className="font-medium text-muted-foreground">
                  身分證反面
                </span>
                <div className="col-span-2 text-foreground text-xs">
                  <IdentityDocument key={selectedApp.id + "-back"} id={selectedApp.id} side="back" isDemo={selectedApp.isDemo} />
                </div>
              </div>
              <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                <span className="font-medium text-muted-foreground">
                  同意條款
                </span>
                <span className="col-span-2 text-foreground">
                  {selectedApp.agreeToContract ? "已同意合約條款" : "未同意"}
                </span>
              </div>

              {selectedApp.contractContent && <details className="rounded border border-border/50 p-3">
                <summary className="cursor-pointer text-foreground">送件時同意的合約（{selectedApp.contractVersion}）</summary>
                <p className="my-2 text-xs">同意時間：{selectedApp.consentedAt || "—"}</p>
                <pre className="whitespace-pre-wrap break-words font-sans text-sm">{selectedApp.contractContent}</pre>
              </details>}
              {!!selectedApp.reviewHistory?.length && <details className="rounded border border-border/50 p-3">
                <summary className="cursor-pointer text-foreground">審核紀錄</summary>
                {selectedApp.reviewHistory.map((entry, index) => <div key={index} className="mt-3 space-y-2 border-t pt-2 text-sm">
                  <p>{entry.created_at}・管理員 {entry.reviewer_id}</p>
                  <div className="flex items-center gap-2">{renderStatusBadge(entry.from_status)} → {renderStatusBadge(entry.to_status)}</div>
                  {entry.reason && <p className="whitespace-pre-wrap">{entry.reason}</p>}
                </div>)}
              </details>}
              {selectedApp.isDemo && <p className="text-sm">此筆為示範資料，僅供查看，無法送出審核。</p>}
              {reviewError && <p role="alert" className="text-destructive">{reviewError}</p>}
              {needsRefresh && <Button variant="outline" onClick={() => void openApplication(selectedApp)}>重新載入此申請</Button>}

              {/* 現有系統保留規格 */}
              <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                <span className="font-medium text-muted-foreground">
                  申請日期
                </span>
                <span className="col-span-2 text-foreground">
                  {selectedApp.date}
                </span>
              </div>
              <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                <span className="font-medium text-muted-foreground">
                  當前狀態
                </span>
                <span className="col-span-2">
                  {renderStatusBadge(selectedApp.status)}
                </span>
              </div>
              {selectedApp.status === "rejected" &&
                selectedApp.rejectReason && (
                  <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                    <span className="text-xs font-semibold text-destructive block mb-1">
                      退件理由：
                    </span>
                    <p className="text-sm text-foreground/90">
                      {selectedApp.rejectReason}
                    </p>
                  </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end gap-3">
              <Button
                variant="outline"
                disabled={saving}
                onClick={closeApplication}
                className="bg-transparent text-muted-foreground hover:text-foreground"
              >
                關閉
              </Button>

              {!selectedApp.isDemo && !needsRefresh && selectedApp.status === "pending" && (
                <>
                  <Button
                    variant="destructive"
                    disabled={saving}
                    onClick={() => setConfirmType("reject")}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" /> 拒絕
                  </Button>
                  <Button
                    disabled={saving}
                    onClick={() => setConfirmType("approve")}
                    className="gap-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                  >
                    <Check className="h-4 w-4" /> 通過
                  </Button>
                </>
              )}

              {!selectedApp.isDemo && !needsRefresh && selectedApp.status === "rejected" && (
                <Button
                  disabled={saving}
                  onClick={() => setConfirmType("re-evaluate")}
                  className="gap-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                >
                  <RefreshCw className="h-4 w-4" /> 重新審核
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 第二層：二次確認彈窗 Modal */}
      {confirmType && selectedApp && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {saving && <p role="status">審核儲存中，請稍候…</p>}
            {/* 通過確認 */}
            {confirmType === "approve" && (
              <>
                <h4 className="text-lg font-bold text-foreground">
                  確認通過審核
                </h4>
                <p className="text-sm text-muted-foreground">
                  確定要通過此創作者申請嗎？
                </p>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    disabled={saving}
                    onClick={() => setConfirmType(null)}
                    className="bg-transparent text-muted-foreground hover:text-foreground"
                  >
                    取消
                  </Button>
                  <Button
                    disabled={saving}
                    onClick={() =>
                      void handleStatusChange(selectedApp.id, "approved")
                    }
                    className="bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                  >
                    確認
                  </Button>
                </div>
              </>
            )}

            {/* 拒絕確認 */}
            {confirmType === "reject" && (
              <>
                <h4 className="text-lg font-bold text-foreground">
                  確認拒絕審核
                </h4>
                <p className="text-sm text-muted-foreground">
                  確定要拒絕此創作者申請嗎？
                </p>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    請填寫拒絕原因：
                  </label>
                  <textarea
                    maxLength={2000}
                    disabled={saving}
                    value={rejectInputReason}
                    onChange={(e) => setRejectInputReason(e.target.value)}
                    placeholder="請輸入拒絕原因..."
                    className="w-full bg-transparent border border-border rounded-lg p-2.5 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none h-24 resize-none placeholder-muted-foreground"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    disabled={saving}
                    onClick={() => setConfirmType(null)}
                    className="bg-transparent text-muted-foreground hover:text-foreground"
                  >
                    取消
                  </Button>
                  <Button
                    disabled={saving || !rejectInputReason.trim()}
                    variant="destructive"
                    onClick={() =>
                      void handleStatusChange(
                        selectedApp.id,
                        "rejected",
                        rejectInputReason,
                      )
                    }
                    className="disabled:opacity-30"
                  >
                    確認拒絕
                  </Button>
                </div>
              </>
            )}

            {/* 重新審核確認 */}
            {confirmType === "re-evaluate" && (
              <>
                <h4 className="text-lg font-bold text-foreground">
                  重新審核提示
                </h4>
                <p className="text-sm text-muted-foreground">
                  確定要將此申請重新設為未審核嗎？
                </p>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    disabled={saving}
                    onClick={() => setConfirmType(null)}
                    className="bg-transparent text-muted-foreground hover:text-foreground"
                  >
                    取消
                  </Button>
                  <Button
                    disabled={saving}
                    onClick={() =>
                      void handleStatusChange(selectedApp.id, "pending")
                    }
                    className="bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                  >
                    確認
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
