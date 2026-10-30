"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CommissionRequestRow } from "@/components/commission/commission-request-card";
import { CommissionRequestDetailModal } from "@/components/admin/commission-request-detail-modal";
import {
  mockCommissionRequests,
  type CommissionRequest,
  type CommissionRequestStatus,
} from "@/types/commission-request";
import { updateCommissionSortOrder } from "@/services/commissionService";

const ALL_FEATURES = [
  "創作者基本媒合（一品牌調性配對提案）",
  "基礎貼文文案與Hashtag建議",
  "成效報表（曝光/互動）",
  "合作溝通",
  "成效數據分析（曝光/互動）",
  "合約代管",
  "創作者管理",
  "客製創作者媒合（精準受眾）",
  "基礎專案管理",
  "內容策略與主題規劃",
  "專案管理",
  "品質控管",
  "品牌素材/腳本協助",
  "創作者串聯曝光",
  "內容優化建議",
  "主題企劃（活動/檔期操作）",
  "年度內容排程",
  "跨平台內容策略（IG/Reels/Shorts）",
  "廣告素材產出（不含媒體費）",
  "原創IP角色聯名使用權（期間內）",
  "產品優先排程",
  "專屬長期內容策略顧問",
  "專屬團隊支持",
  "大型活動／快閃活動聯名",
  "專屬創作者池（固定合作班底）",
];

const initialSubscriptionPlans = [
  {
    id: "starter",
    name: "Starter",
    title: "試水營量",
    subtitle: "想測試創作者合作效果的品牌",
    price: "$12,000",
    period: "/月",
    originalPrice: "季繳$32,400（9折）",
    popular: false,
    creatorCount: "1位/月",
    monthlyDesigns: "2款設計",
    sortOrder: 1,
    features: ALL_FEATURES.map((f, i) => ({
      name: f,
      included: [0, 1, 2, 6].includes(i),
    })),
  },
  {
    id: "growth",
    name: "Growth 成長",
    title: "Growth 成長",
    subtitle: "想穩定經營內容與品牌聲量",
    price: "$25,000",
    period: "/月",
    originalPrice: "半年$127,500（85折）",
    popular: true,
    creatorCount: "3位/月",
    monthlyDesigns: "6款設計",
    sortOrder: 2,
    features: ALL_FEATURES.map((f, i) => ({ name: f, included: i < 15 })),
  },
  {
    id: "scale",
    name: "Scale",
    title: "擴散曝光",
    subtitle: "需要快速提升曝光與討論度",
    price: "$55,000",
    period: "/月",
    originalPrice: "年繳$528,000（8折）",
    popular: false,
    creatorCount: "6位/月",
    monthlyDesigns: "12款設計",
    sortOrder: 3,
    features: ALL_FEATURES.map((f, i) => ({ name: f, included: i < 21 })),
  },
];

const STATUS_TABS: { value: CommissionRequestStatus | "all"; label: string }[] =
  [
    { value: "all", label: "全部" },
    { value: "pending", label: "待審核" },
    { value: "approved", label: "待媒合" },
    { value: "contracting", label: "待簽約" },
    { value: "in-progress", label: "進行中" },
    { value: "delivery", label: "待驗收" },
    { value: "completed", label: "已完成" },
    { value: "rejected", label: "已拒絕" },
  ];

export default function AdminQuestsPage() {
  const [plans, setPlans] = useState(initialSubscriptionPlans);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<
    (typeof initialSubscriptionPlans)[0] | null
  >(null);

  // 委託需求清單狀態
  const [commissionRequests, setCommissionRequests] = useState<
    CommissionRequest[]
  >(mockCommissionRequests);
  const [activeTab, setActiveTab] = useState<CommissionRequestStatus | "all">(
    "all",
  );
  const [selectedRequest, setSelectedRequest] =
    useState<CommissionRequest | null>(null);

  const filteredRequests = (
    activeTab === "all"
      ? commissionRequests
      : commissionRequests.filter((r) => r.status === activeTab)
  ).sort((a, b) => a.sortOrder - b.sortOrder);

  const handleApprove = (id: string) => {
    setCommissionRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const next: Partial<
          Record<CommissionRequestStatus, CommissionRequestStatus>
        > = {
          pending: "approved",
          approved: "contracting",
          contracting: "in-progress",
          "in-progress": "delivery",
          delivery: "completed",
        };
        const nextStatus = next[r.status];
        return nextStatus ? { ...r, status: nextStatus } : r;
      }),
    );
  };

  const handleReject = (id: string) => {
    setCommissionRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "rejected" as CommissionRequestStatus }
          : r,
      ),
    );
  };

  // 依 sortOrder 排序後的完整清單（用於判斷 isFirst/isLast 和執行移動）
  const sortedRequests = [...commissionRequests].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  const handleMoveUp = (id: string) => {
    const sorted = [...commissionRequests].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
    const idx = sorted.findIndex((r) => r.id === id);
    if (idx <= 0) return;
    const prev = sorted[idx - 1];
    const curr = sorted[idx];
    setCommissionRequests((list) =>
      list.map((r) => {
        if (r.id === curr.id) return { ...r, sortOrder: prev.sortOrder };
        if (r.id === prev.id) return { ...r, sortOrder: curr.sortOrder };
        return r;
      }),
    );
    updateCommissionSortOrder(curr.id, prev.sortOrder);
    updateCommissionSortOrder(prev.id, curr.sortOrder);
  };

  const handleMoveDown = (id: string) => {
    const sorted = [...commissionRequests].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
    const idx = sorted.findIndex((r) => r.id === id);
    if (idx < 0 || idx >= sorted.length - 1) return;
    const next = sorted[idx + 1];
    const curr = sorted[idx];
    setCommissionRequests((list) =>
      list.map((r) => {
        if (r.id === curr.id) return { ...r, sortOrder: next.sortOrder };
        if (r.id === next.id) return { ...r, sortOrder: curr.sortOrder };
        return r;
      }),
    );
    updateCommissionSortOrder(curr.id, next.sortOrder);
    updateCommissionSortOrder(next.id, curr.sortOrder);
  };

  // 表單狀態
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    title: "",
    subtitle: "",
    price: "",
    period: "/月",
    originalPrice: "",
    popular: false,
    creatorCount: "",
    monthlyDesigns: "",
    sortOrder: 1,
    features: ALL_FEATURES.map((f) => ({ name: f, included: false })), // 💡 初始化全為 false
  });

  // 打開新增方案
  const handleOpenAdd = () => {
    setSelectedPlan(null);
    setFormData({
      id: `plan_${Date.now().toString().slice(-4)}`,
      name: "",
      title: "",
      subtitle: "",
      price: "$",
      period: "/月",
      originalPrice: "",
      popular: false,
      creatorCount: "",
      monthlyDesigns: "",
      sortOrder: plans.length + 1,
      features: ALL_FEATURES.map((f) => ({ name: f, included: false })),
    });
    setIsModalOpen(true);
  };

  // 打開編輯方案
  const handleOpenEdit = (plan: (typeof initialSubscriptionPlans)[0]) => {
    setSelectedPlan(plan);
    setFormData({ ...plan });
    setIsModalOpen(true);
  };

  // 處理單個 Checkbox 狀態切換
  const handleFeatureToggle = (featureName: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((f) =>
        f.name === featureName ? { ...f, included: checked } : f,
      ),
    }));
  };

  // 一鍵全選或全取消
  const handleSelectAllFeatures = (included: boolean) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((f) => ({ ...f, included })),
    }));
  };

  // 處理儲存
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id.trim() || !formData.name.trim() || !formData.title.trim())
      return;

    if (selectedPlan) {
      setPlans(
        plans.map((p) =>
          p.id === selectedPlan.id ? { ...p, ...formData } : p,
        ),
      );
    } else {
      setPlans([...plans, { ...formData }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("確定要刪除這個訂閱合作方案嗎？")) {
      setPlans(plans.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* 頂部列 */}

      {/* 委託需求清單 */}
      <div className="space-y-6">
        <AdminPageHeader
          title="委託需求清單"
          description="顧客提交的委託申請，點擊列可查看詳情並推進或拒絕。"
          action={<span className="text-sm text-muted-foreground">共 {commissionRequests.length} 筆</span>}
        />

        {/* 五步驟流程提示 */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground overflow-x-auto pb-1">
          {[
            { value: "pending", label: "① 待審核" },
            { value: "approved", label: "② 待媒合" },
            { value: "contracting", label: "③ 待簽約" },
            { value: "in-progress", label: "④ 進行中" },
            { value: "delivery", label: "⑤ 待驗收" },
            { value: "completed", label: "⑥ 已完成" },
            { value: "rejected", label: "✕ 已拒絕" },
          ].map((step, i, arr) => (
            <span key={step.value} className="flex items-center gap-1 shrink-0">
              <button
                onClick={() =>
                  setActiveTab(step.value as CommissionRequestStatus)
                }
                className={`px-2.5 py-1 rounded border transition-colors ${
                  activeTab === step.value
                    ? "border-primary text-primary bg-primary/10"
                    : "border-border/40 hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {step.label}
                <span className="ml-1 opacity-60">
                  (
                  {
                    commissionRequests.filter((r) => r.status === step.value)
                      .length
                  }
                  )
                </span>
              </button>
              {i < arr.length - 2 && <span className="text-border/60">→</span>}
            </span>
          ))}
          <span className="mx-2 text-border/40">|</span>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-2.5 py-1 rounded border transition-colors shrink-0 ${
              activeTab === "all"
                ? "border-primary text-primary bg-primary/10"
                : "border-border/40 hover:border-primary/40 hover:text-foreground"
            }`}
          >
            全部 ({commissionRequests.length})
          </button>
        </div>

        {/* 表格 */}
        <Card className="border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-white/5 text-sm font-medium text-muted-foreground">
                  <th className="px-6 py-3">委託標題</th>
                  <th className="px-4 py-3 whitespace-nowrap">類型</th>
                  <th className="px-4 py-3 whitespace-nowrap">狀態</th>
                  <th className="px-4 py-3 whitespace-nowrap">預算範圍</th>
                  <th className="px-4 py-3 whitespace-nowrap">截止日期</th>
                  <th className="px-4 py-3 w-20 text-center whitespace-nowrap">
                    排序
                  </th>
                  <th className="px-4 py-3 w-16 text-center whitespace-nowrap">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req, i) => (
                    <CommissionRequestRow
                      key={req.id}
                      request={req}
                      isFirst={sortedRequests[0]?.id === req.id}
                      isLast={
                        sortedRequests[sortedRequests.length - 1]?.id === req.id
                      }
                      onClick={setSelectedRequest}
                      onMoveUp={handleMoveUp}
                      onMoveDown={handleMoveDown}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      此狀態目前沒有委託需求
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
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
