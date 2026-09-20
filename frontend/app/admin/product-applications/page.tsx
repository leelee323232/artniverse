"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  Check,
  X,
  RefreshCw,
  Package,
  Download,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getApplications, reviewApplication, apiError, type Application } from "@/lib/products-api";
import type {
  ProductApplicationStatus,
} from "@/types/admin";

export default function ProductApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>(
    [],
  );
  const [selectedApp, setSelectedApp] = useState<Application | null>(
    null,
  );
  const [confirmType, setConfirmType] = useState<
    "approve" | "reject" | "re-evaluate" | null
  >(null);
  const [rejectInputReason, setRejectInputReason] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [status, setStatus] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(""); setApplications([]);
    getApplications(page, status, controller.signal).then((response) => {
      setApplications(response.data); setLastPage(response.meta.last_page);
    }).catch((err) => { if (!controller.signal.aborted) setError(apiError(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, status, reload]);

  const renderStatusBadge = (status: ProductApplicationStatus) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
            待審核
          </span>
        );
      case "approved":
        return (
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            已通過
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-destructive/10 text-destructive border border-destructive/20">
            已拒絕
          </span>
        );
    }
  };

  const handleStatusChange = async (id: string, newStatus: ProductApplicationStatus, reason?: string) => {
    if (!selectedApp || selectedApp.id !== id || saving) return;
    setSaving(true); setError("");
    try {
      const updated = await reviewApplication(selectedApp, newStatus, reason);
      setSelectedApp(updated); setConfirmType(null); setRejectInputReason("");
      setReload((value) => value + 1);
    } catch (err) { setError(apiError(err)); }
    finally { setSaving(false); }
  };

  const formatMoney = (value: number | null) => value == null ? "未提供" : `NT$ ${value.toLocaleString()}`;
  const formatFileSize = (size: number | null) => size == null ? "大小未提供" :
    `${(size / 1024 / 1024).toFixed(size >= 1024 * 1024 ? 1 : 2)} MB`;

  return (
    <div>
      <AdminPageHeader
        title="商品開發申請審核"
        description="審核創作者送出的商品開發申請，可查看設計與成本後決定通過或拒絕製作。"
      />

      <div className="mb-4 flex gap-3 items-center">
        <select aria-label="審核狀態" className="border rounded p-2 bg-background" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">全部狀態</option><option value="pending">待審核</option><option value="approved">已通過</option><option value="rejected">已拒絕</option>
        </select>
        <Button variant="outline" disabled={loading} onClick={() => setReload((value) => value + 1)}>重新載入</Button>
        {loading && <span role="status">載入中…</span>}
      </div>
      {error && <p role="alert" className="mb-4 text-destructive">{error}</p>}
      {/* 列表表格 */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/40 border-b border-border text-muted-foreground text-sm font-semibold">
              <th className="p-4">創作者 / 品牌</th>
              <th className="p-4">產品類型</th>
              <th className="p-4">分類</th>
              <th className="p-4">設定售價</th>
              <th className="p-4">申請日期</th>
              <th className="p-4">狀態</th>
              <th className="p-4 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className="border-b border-border/60 hover:bg-muted/40 cursor-pointer transition-colors text-muted-foreground hover:text-foreground text-sm"
              >
                <td className="p-4">
                  <div className="font-medium text-foreground">
                    {app.creatorName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {app.brandName}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-foreground">{app.productType}</div>
                  {app.isCustomProduct && (
                    <span className="text-xs text-primary">客製化需求</span>
                  )}
                </td>
                <td className="p-4">{app.category}</td>
                <td className="p-4">
                  {(app.sellingPrice ?? 0) > 0 ? formatMoney(app.sellingPrice) : "—"}
                </td>
                <td className="p-4">{app.date}</td>
                <td className="p-4">{renderStatusBadge(app.status)}</td>
                <td
                  className="p-4 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedApp(app)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {!loading && !error && applications.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-10 text-center text-muted-foreground"
                >
                  目前沒有申請資料
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-3 items-center">
        <Button variant="outline" disabled={loading || page <= 1} onClick={() => setPage(page - 1)}>上一頁</Button>
        <span>第 {page} / {lastPage} 頁</span>
        <Button variant="outline" disabled={loading || page >= lastPage} onClick={() => setPage(page + 1)}>下一頁</Button>
      </div>
      {/* 第一層：商品申請詳細資料 Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-40 p-4 animate-in fade-in duration-150">
          <div className="bg-background border border-border/80 rounded-xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-border/50 flex justify-between items-center bg-muted/20">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                商品開發申請詳情
              </h3>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-muted-foreground hover:text-foreground text-xl transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto text-muted-foreground">
              {/* 設計圖預覽 */}
              <div>
                <h4 className="mb-3 text-sm font-semibold text-foreground">
                  設計圖（{selectedApp.designs.length} 個印刷區域）
                </h4>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {selectedApp.designs.map((design, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border/50 bg-muted/20 p-3"
                    >
                      <div className="aspect-square overflow-hidden rounded-md bg-white/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={design.imageUrl}
                          alt={design.zoneName}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <p className="mt-2 text-center text-xs text-foreground">
                        {design.zoneName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">
                  審核檔案
                </h4>
                {selectedApp.designs.map((design, index) => (
                  <div
                    key={`${design.zoneName}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/20 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate text-sm text-foreground">
                        {design.zoneName}效果圖
                      </span>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="shrink-0 bg-transparent"
                    >
                      <a
                        href={design.imageUrl}
                        download={`${design.zoneName}效果圖.png`}
                      >
                        <Download className="mr-1 h-4 w-4" />
                        下載
                      </a>
                    </Button>
                  </div>
                ))}
                {selectedApp.templateFile ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {selectedApp.templateFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          刀模檔案 ·{" "}
                          {formatFileSize(selectedApp.templateFile.size)}
                        </p>
                      </div>
                    </div>
                    <Button asChild size="sm" className="shrink-0">
                      <a
                        href={selectedApp.templateFile.url}
                        download={selectedApp.templateFile.name}
                      >
                        <Download className="mr-1 h-4 w-4" />
                        下載
                      </a>
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    此商品未提供刀模檔案。
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">{selectedApp.name}</h4>
                <p className="whitespace-pre-wrap">{selectedApp.description}</p>
                <p>販售方式：{selectedApp.saleType === "general" ? "一般" : selectedApp.saleType === "auction" ? "競標" : "預售"}</p>
                {selectedApp.note && <p>創作者備註：{selectedApp.note}</p>}
                {selectedApp.saleType === "auction" && <p>起標價：{selectedApp.auctionStartPrice ?? "未提供"}；最低加價：{selectedApp.auctionMinIncrement ?? "未提供"}<br />期間：{selectedApp.auctionStartTime ?? "未提供"} ～ {selectedApp.auctionEndTime ?? "未提供"}</p>}
                {selectedApp.saleType === "presale" && <p>達標數量：{selectedApp.presaleTargetQuantity ?? "未提供"}<br />期間：{selectedApp.presaleStartDate ?? "未提供"} ～ {selectedApp.presaleEndDate ?? "未提供"}</p>}
              </div>
              {/* 產品資訊 */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">
                  產品資訊
                </h4>
                <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                  <span className="font-medium">創作者</span>
                  <span className="col-span-2 text-foreground">
                    {selectedApp.creatorName}（{selectedApp.brandName}）
                  </span>
                </div>
                <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                  <span className="font-medium">產品類型</span>
                  <span className="col-span-2 text-foreground">
                    {selectedApp.productType}
                    {selectedApp.productTypeEn
                      ? `（${selectedApp.productTypeEn}）`
                      : ""}
                  </span>
                </div>
                <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                  <span className="font-medium">產品分類</span>
                  <span className="col-span-2 text-foreground">
                    {selectedApp.category}
                  </span>
                </div>
                {selectedApp.isCustomProduct && selectedApp.customRequest && (
                  <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                    <span className="font-medium">客製化需求</span>
                    <span className="col-span-2 text-foreground whitespace-pre-wrap">
                      {selectedApp.customRequest}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                  <span className="font-medium">印刷尺寸</span>
                  <span className="col-span-2 text-foreground">
                    {selectedApp.uploadedImageSize}
                  </span>
                </div>
                {selectedApp.preOrderQuantity ? (
                  <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                    <span className="font-medium">預先備貨數量</span>
                    <span className="col-span-2 text-foreground">
                      {selectedApp.preOrderQuantity} 件
                    </span>
                  </div>
                ) : null}
              </div>

              {/* 成本與售價 */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">
                  成本與售價
                </h4>
                <div className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>產品基本成本</span>
                    <span className="text-foreground">
                      {formatMoney(selectedApp.baseCost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>印刷費用</span>
                    <span className="text-foreground">
                      {formatMoney(selectedApp.printingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border/30 pt-2">
                    <span>生產成本</span>
                    <span className="text-foreground">
                      {formatMoney(selectedApp.productionCost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>備貨成本</span>
                    <span className="text-blue-500 font-medium">
                      {formatMoney(selectedApp.stockingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border/30 pt-2">
                    <span className="font-semibold text-foreground">
                      創作者設定售價
                    </span>
                    <span className="text-lg font-bold text-emerald-500">
                      {(selectedApp.sellingPrice ?? 0) > 0
                        ? formatMoney(selectedApp.sellingPrice)
                        : "待定"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 申請狀態 */}
              <div className="space-y-3">
                <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                  <span className="font-medium">申請日期</span>
                  <span className="col-span-2 text-foreground">
                    {selectedApp.date}
                  </span>
                </div>
                <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                  <span className="font-medium">當前狀態</span>
                  <span className="col-span-2">
                    {renderStatusBadge(selectedApp.status)}
                  </span>
                </div>
                {selectedApp.status === "rejected" &&
                  selectedApp.rejectReason && (
                    <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                      <span className="text-xs font-semibold text-destructive block mb-1">
                        拒絕理由：
                      </span>
                      <p className="text-sm text-foreground/90">
                        {selectedApp.rejectReason}
                      </p>
                    </div>
                  )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedApp(null)}
                className="bg-transparent text-muted-foreground hover:text-foreground"
              >
                關閉
              </Button>

              {selectedApp.status === "pending" && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => setConfirmType("reject")}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" /> 拒絕
                  </Button>
                  <Button
                    onClick={() => setConfirmType("approve")}
                    className="gap-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                  >
                    <Check className="h-4 w-4" /> 通過
                  </Button>
                </>
              )}

              {/* 已通過的申請仍可拒絕 */}
              {selectedApp.status === "approved" && (
                <Button
                  variant="destructive"
                  onClick={() => setConfirmType("reject")}
                  className="gap-2"
                >
                  <X className="h-4 w-4" /> 拒絕
                </Button>
              )}

              {/* 已拒絕的申請可重新審核 */}
              {selectedApp.status === "rejected" && (
                <Button
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

      {/* 第二層：二次確認彈窗 */}
      {confirmType && selectedApp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {error && <p role="alert" className="text-destructive">{error}</p>}
            {/* 通過確認 */}
            {confirmType === "approve" && (
              <>
                <h4 className="text-lg font-bold text-foreground">
                  確認通過申請
                </h4>
                <p className="text-sm text-muted-foreground">
                  確定要通過此商品開發申請嗎？一般商品會建立商品資料，庫存需待入庫後設定；競標與預售目前僅記錄審核結果。
                </p>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    disabled={saving} onClick={() => setConfirmType(null)}
                    className="bg-transparent text-muted-foreground hover:text-foreground"
                  >
                    取消
                  </Button>
                  <Button
                    disabled={saving}
                    onClick={() =>
                      handleStatusChange(selectedApp.id, "approved")
                    }
                    className="bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                  >
                    確認通過
                  </Button>
                </div>
              </>
            )}

            {/* 拒絕確認 */}
            {confirmType === "reject" && (
              <>
                <h4 className="text-lg font-bold text-foreground">
                  確認拒絕申請
                </h4>
                <p className="text-sm text-muted-foreground">
                  確定要拒絕此商品開發申請嗎？
                </p>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    請填寫拒絕原因：
                  </label>
                  <textarea
                    value={rejectInputReason}
                    onChange={(e) => setRejectInputReason(e.target.value)}
                    placeholder="請輸入拒絕原因..."
                    className="w-full bg-transparent border border-border rounded-lg p-2.5 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none h-24 resize-none placeholder-muted-foreground"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    disabled={saving} onClick={() => setConfirmType(null)}
                    className="bg-transparent text-muted-foreground hover:text-foreground"
                  >
                    取消
                  </Button>
                  <Button
                    disabled={saving || !rejectInputReason.trim()}
                    variant="destructive"
                    onClick={() =>
                      handleStatusChange(
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
                  確定要將此申請重新設為待審核嗎？
                </p>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    disabled={saving} onClick={() => setConfirmType(null)}
                    className="bg-transparent text-muted-foreground hover:text-foreground"
                  >
                    取消
                  </Button>
                  <Button
                    disabled={saving}
                    onClick={() =>
                      handleStatusChange(selectedApp.id, "pending")
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
