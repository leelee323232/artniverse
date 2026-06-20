"use client";

import React, { useState } from "react";
import { Eye, Check, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type ApplicationStatus = "pending" | "approved" | "rejected";

interface Application {
  id: string;
  name: string;
  brandName: string;
  email: string;
  date: string;
  status: ApplicationStatus;
  rejectReason?: string;
}

const initialApplications: Application[] = [
  { id: "1", name: "小小", brandName: "Artic Studio", email: "wei@example.com", date: "2026-06-20", status: "pending" },
  { id: "2", name: "中中", brandName: "Meme Lab", email: "mei@example.com", date: "2026-06-19", status: "approved" },
  { id: "3", name: "大大", brandName: "Space Flight", email: "howard@example.com", date: "2026-06-18", status: "rejected", rejectReason: "資料格式不正確" },
];

export default function CreatorApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [confirmType, setConfirmType] = useState<"approve" | "reject" | "re-evaluate" | null>(null);
  const [rejectInputReason, setRejectInputReason] = useState("");

  const renderStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "pending":
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">未審核</span>;
      case "approved":
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">審核通過</span>;
      case "rejected":
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-destructive/10 text-destructive border border-destructive/20">審核失敗</span>;
    }
  };

  const handleStatusChange = (id: string, newStatus: ApplicationStatus, reason?: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, status: newStatus, rejectReason: reason || "" } : app
      )
    );
    setSelectedApp((prev) => (prev && prev.id === id ? { ...prev, status: newStatus, rejectReason: reason || "" } : prev));
    setConfirmType(null);
    setRejectInputReason("");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen text-foreground">
      <h1 className="text-2xl font-bold mb-6 tracking-wide text-foreground">
        創作者申請審核管理
      </h1>

      {/* 列表表格：完全沿用導覽列的背景與邊框標準 */}
      <div className="bg-background/80 backdrop-blur-lg rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/30 border-b border-border/50 text-muted-foreground text-sm font-semibold">
              <th className="p-4">姓名</th>
              <th className="p-4">品牌名稱</th>
              <th className="p-4">Email</th>
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
                className="border-b border-border/40 hover:bg-muted/40 cursor-pointer transition-colors text-muted-foreground hover:text-foreground text-sm"
              >
                <td className="p-4 font-medium text-foreground">{app.name}</td>
                <td className="p-4">{app.brandName}</td>
                <td className="p-4">{app.email}</td>
                <td className="p-4">{app.date}</td>
                <td className="p-4">{renderStatusBadge(app.status)}</td>
                <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
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
          </tbody>
        </table>
      </div>

      {/* 第一層：詳細資料視窗 Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-40 p-4 animate-in fade-in duration-150">
          <div className="bg-background border border-border/80 rounded-xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-border/50 flex justify-between items-center bg-muted/20">
              <h3 className="text-lg font-bold text-foreground">創作者詳細申請資料</h3>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-muted-foreground hover:text-foreground text-xl transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 overflow-y-auto text-muted-foreground">
              <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                <span className="font-medium text-muted-foreground">申請人姓名</span>
                <span className="col-span-2 font-semibold text-foreground">{selectedApp.name}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                <span className="font-medium text-muted-foreground">品牌名稱</span>
                <span className="col-span-2 font-semibold text-foreground">{selectedApp.brandName}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                <span className="font-medium text-muted-foreground">電子信箱</span>
                <span className="col-span-2 text-foreground">{selectedApp.email}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                <span className="font-medium text-muted-foreground">申請日期</span>
                <span className="col-span-2 text-foreground">{selectedApp.date}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-border/30 pb-2">
                <span className="font-medium text-muted-foreground">當前狀態</span>
                <span className="col-span-2">{renderStatusBadge(selectedApp.status)}</span>
              </div>
              {selectedApp.status === "rejected" && selectedApp.rejectReason && (
                <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                  <span className="text-xs font-semibold text-destructive block mb-1">退件理由：</span>
                  <p className="text-sm text-foreground/90">{selectedApp.rejectReason}</p>
                </div>
              )}
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

      {/* 第二層：二次確認彈窗 Modal */}
      {confirmType && selectedApp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            {/* 通過確認 */}
            {confirmType === "approve" && (
              <>
                <h4 className="text-lg font-bold text-foreground">確認通過審核</h4>
                <p className="text-sm text-muted-foreground">確定要通過此創作者申請嗎？</p>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setConfirmType(null)} className="bg-transparent text-muted-foreground hover:text-foreground">取消</Button>
                  <Button onClick={() => handleStatusChange(selectedApp.id, "approved")} className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">確認</Button>
                </div>
              </>
            )}

            {/* 拒絕確認 */}
            {confirmType === "reject" && (
              <>
                <h4 className="text-lg font-bold text-foreground">確認拒絕審核</h4>
                <p className="text-sm text-muted-foreground">確定要拒絕此創作者申請嗎？</p>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">請填寫拒絕原因：</label>
                  <textarea
                    value={rejectInputReason}
                    onChange={(e) => setRejectInputReason(e.target.value)}
                    placeholder="請輸入拒絕原因..."
                    className="w-full bg-transparent border border-border rounded-lg p-2.5 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none h-24 resize-none placeholder-muted-foreground"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setConfirmType(null)} className="bg-transparent text-muted-foreground hover:text-foreground">取消</Button>
                  <Button
                    disabled={!rejectInputReason.trim()}
                    variant="destructive"
                    onClick={() => handleStatusChange(selectedApp.id, "rejected", rejectInputReason)}
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
                <h4 className="text-lg font-bold text-foreground">重新審核提示</h4>
                <p className="text-sm text-muted-foreground">確定要將此申請重新設為未審核嗎？</p>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setConfirmType(null)} className="bg-transparent text-muted-foreground hover:text-foreground">取消</Button>
                  <Button onClick={() => handleStatusChange(selectedApp.id, "pending")} className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">確認</Button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}