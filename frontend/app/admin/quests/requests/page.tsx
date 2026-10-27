"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CommissionRequestCard } from "@/components/commission/commission-request-card";
import { CommissionRequestDetailModal } from "@/components/admin/commission-request-detail-modal";
import {
  mockCommissionRequests,
  type CommissionRequest,
  type CommissionRequestStatus,
} from "@/types/commission-request";

const STATUS_TABS: { value: CommissionRequestStatus | "all"; label: string }[] =
  [
    { value: "all", label: "全部" },
    { value: "pending", label: "未開始" },
    { value: "in-progress", label: "進行中" },
    { value: "completed", label: "已完成" },
  ];

export default function AdminCommissionRequestsPage() {
  // 委託需求清單狀態
  const [commissionRequests, setCommissionRequests] = useState<
    CommissionRequest[]
  >(mockCommissionRequests);
  const [activeTab, setActiveTab] = useState<CommissionRequestStatus | "all">(
    "all",
  );
  const [selectedRequest, setSelectedRequest] =
    useState<CommissionRequest | null>(null);

  const filteredRequests =
    activeTab === "all"
      ? commissionRequests
      : commissionRequests.filter((r) => r.status === activeTab);

  const handleApprove = (id: string) => {
    setCommissionRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "in-progress" as CommissionRequestStatus }
          : r,
      ),
    );
  };

  const handleReject = (id: string) => {
    setCommissionRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "completed" as CommissionRequestStatus }
          : r,
      ),
    );
  };

  return (
    <div className="space-y-6 p-6 min-h-screen text-foreground">
      {/* 委託需求清單 */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">委託需求清單</h1>
          <p className="text-sm text-muted-foreground">
            顧客提交的委託申請，點擊卡片可查看詳情並通過或拒絕。
          </p>
        </div>

        {/* 狀態篩選 */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_TABS.map((tab) => {
            const count =
              tab.value === "all"
                ? commissionRequests.length
                : commissionRequests.filter((r) => r.status === tab.value)
                    .length;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  activeTab === tab.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* 卡片清單 */}
        <div className="space-y-3">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
              <CommissionRequestCard
                key={req.id}
                request={req}
                onClick={setSelectedRequest}
              />
            ))
          ) : (
            <Card className="border-border/50 bg-card/30 p-12 text-center backdrop-blur-sm">
              <p className="text-muted-foreground">此狀態目前沒有委託需求</p>
            </Card>
          )}
        </div>
      </div>

      {/* 詳情 Modal */}
      {selectedRequest && (
        <CommissionRequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
