"use client";

import { useEffect, useState } from "react";
import { Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AdminTable,
  type AdminTableColumn,
} from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminField } from "@/components/admin/AdminField";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { StatusToggle } from "@/components/admin/StatusToggle";
import { useAdminCrud } from "@/lib/admin/useAdminCrud";
import { mockActivities } from "@/mocks/admin/activities";
import type { Activity, ActivityReviewStatus } from "@/types/admin";
import { BasicDatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

interface CreateFormState {
  title: string;
  linkUrl: string;
  sortOrder: string;
  isActive: boolean;
  startTime: Date | null;
  endTime: Date | null;
  publishStartTime: Date | null;
  publishEndTime: Date | null;
}

const emptyCreateForm: CreateFormState = {
  title: "",
  linkUrl: "",
  sortOrder: "1",
  isActive: true,
  startTime: null,
  endTime: null,
  publishStartTime: null,
  publishEndTime: null,
};

interface EditFormState {
  title: string;
  linkUrl: string;
  sortOrder: string;
  isActive: boolean;
  startTime: Date | null;
  endTime: Date | null;
  publishStartTime: Date | null;
}

const emptyEditForm: EditFormState = {
  title: "",
  linkUrl: "",
  sortOrder: "1",
  isActive: true,
  startTime: null,
  endTime: null,
  publishStartTime: null,
};

type TabKey = ActivityReviewStatus | "all";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待審核" },
  { key: "approved", label: "已通過" },
  { key: "rejected", label: "已拒絕" },
];

export default function ActivitiesPage() {
  const crud = useAdminCrud<Activity>("a", mockActivities);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [createForm, setCreateForm] =
    useState<CreateFormState>(emptyCreateForm);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [editForm, setEditForm] = useState<EditFormState>(emptyEditForm);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const tabCounts: Record<TabKey, number> = {
    all: crud.items.length,
    pending: crud.items.filter((i) => i.reviewStatus === "pending").length,
    approved: crud.items.filter((i) => i.reviewStatus === "approved").length,
    rejected: crud.items.filter((i) => i.reviewStatus === "rejected").length,
  };

  const visibleItems =
    activeTab === "all"
      ? crud.items
      : crud.items.filter((i) => i.reviewStatus === activeTab);

  const parseDate = (s: string | null) =>
    s ? new Date(s.replace("/", "-").replace("/", "-")) : null;

  useEffect(() => {
    if (!crud.isModalOpen || crud.editingItem) return;
    setCreateForm({
      ...emptyCreateForm,
      sortOrder: String(crud.items.length + 1),
    });
    setCreateErrors({});
  }, [crud.isModalOpen, crud.editingItem, crud.items.length]);

  useEffect(() => {
    if (!crud.isModalOpen || !crud.editingItem) return;
    const e = crud.editingItem;
    setEditForm({
      title: e.title,
      linkUrl: e.linkUrl,
      sortOrder: String(e.sortOrder),
      isActive: e.isActive,
      startTime: parseDate(e.startTime),
      endTime: parseDate(e.endTime),
      publishStartTime: parseDate(e.publishStartTime),
    });
    setEditErrors({});
  }, [crud.isModalOpen, crud.editingItem]);

  const validateCreate = () => {
    const next: Record<string, string> = {};
    if (!createForm.title.trim()) next.title = "請輸入活動名稱";
    if (!createForm.linkUrl.trim()) next.linkUrl = "請輸入連結";
    if (
      createForm.sortOrder === "" ||
      Number.isNaN(Number(createForm.sortOrder))
    )
      next.sortOrder = "排序必須是數字";
    if (!createForm.startTime) next.startTime = "請選擇活動開始時間";
    if (!createForm.endTime) next.endTime = "請選擇活動結束時間";
    if (
      createForm.startTime &&
      createForm.endTime &&
      createForm.endTime <= createForm.startTime
    )
      next.endTime = "結束時間必須晚於開始時間";
    if (!createForm.publishStartTime) next.publishStartTime = "請選擇上架時間";
    if (!createForm.publishEndTime) next.publishEndTime = "請選擇下架時間";
    if (
      createForm.publishStartTime &&
      createForm.publishEndTime &&
      createForm.publishEndTime <= createForm.publishStartTime
    )
      next.publishEndTime = "下架時間必須晚於上架時間";
    setCreateErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateEdit = () => {
    const next: Record<string, string> = {};
    if (!editForm.title.trim()) next.title = "請輸入活動名稱";
    if (!editForm.linkUrl.trim()) next.linkUrl = "請輸入連結";
    if (editForm.sortOrder === "" || Number.isNaN(Number(editForm.sortOrder)))
      next.sortOrder = "排序必須是數字";
    if (!editForm.startTime) next.startTime = "請選擇活動開始時間";
    if (!editForm.endTime) next.endTime = "請選擇活動結束時間";
    if (
      editForm.startTime &&
      editForm.endTime &&
      editForm.endTime <= editForm.startTime
    )
      next.endTime = "結束時間必須晚於開始時間";
    if (!editForm.publishStartTime) next.publishStartTime = "請選擇上架時間";
    setEditErrors(next);
    return Object.keys(next).length === 0;
  };

  const toDateString = (d: Date | null) =>
    d
      ? `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
      : null;

  const handleCreateSubmit = async () => {
    if (!validateCreate()) return;
    const ok = await crud.submit({
      source: "ADMIN",
      reviewStatus: "approved",
      title: createForm.title.trim(),
      linkUrl: createForm.linkUrl.trim(),
      sortOrder: Number(createForm.sortOrder),
      isActive: createForm.isActive,
      startTime: toDateString(createForm.startTime),
      endTime: toDateString(createForm.endTime),
      publishStartTime: toDateString(createForm.publishStartTime),
      publishEndTime: toDateString(createForm.publishEndTime),
    });
    if (ok) setActiveTab("approved");
  };

  const handleEditSubmit = () => {
    if (!validateEdit()) return;
    crud.submit({
      source: "ADMIN",
      reviewStatus: "approved",
      title: editForm.title.trim(),
      linkUrl: editForm.linkUrl.trim(),
      sortOrder: Number(editForm.sortOrder),
      isActive: editForm.isActive,
      startTime: toDateString(editForm.startTime),
      endTime: toDateString(editForm.endTime),
      publishStartTime: toDateString(editForm.publishStartTime),
      publishEndTime: null,
    });
  };

  const handleDelete = (item: Activity) => {
    if (window.confirm(`確定要刪除「${item.title}」嗎？`)) {
      crud.remove(item.id);
    }
  };

  const [reviewingItem, setReviewingItem] = useState<Activity | null>(null);

  const handleReview = (item: Activity, status: "approved" | "rejected") => {
    crud.replaceItems(
      crud.items.map((i) =>
        i.id === item.id
          ? { ...i, reviewStatus: status, isActive: status === "approved" }
          : i,
      ),
    );
    setReviewingItem(null);
  };

  const SOURCE_BADGE: Record<Activity["source"], string> = {
    ADMIN: "bg-blue-500/15 text-blue-600",
    CREATOR: "bg-purple-500/15 text-purple-600",
  };

  const SOURCE_LABEL: Record<Activity["source"], string> = {
    ADMIN: "管理員",
    CREATOR: "創作者",
  };

  const REVIEW_BADGE: Record<Activity["reviewStatus"], string> = {
    pending: "bg-yellow-500/15 text-yellow-600",
    approved: "bg-green-500/15 text-green-600",
    rejected: "bg-red-500/15 text-red-600",
  };

  const REVIEW_LABEL: Record<Activity["reviewStatus"], string> = {
    pending: "待審核",
    approved: "已通過",
    rejected: "已拒絕",
  };

  const columns: AdminTableColumn<Activity>[] = [
    {
      key: "sortOrder",
      header: "排序",
      className: "w-16 text-muted-foreground",
      render: (i) => i.sortOrder,
    },
    {
      key: "title",
      header: "活動名稱",
      render: (i) => <span className="font-medium">{i.title}</span>,
    },
    {
      key: "source",
      header: "來源",
      render: (i) => (
        <span
          className={cn(
            "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
            SOURCE_BADGE[i.source],
          )}
        >
          {SOURCE_LABEL[i.source]}
        </span>
      ),
    },
    {
      key: "reviewStatus",
      header: "審核狀態",
      render: (i) => (
        <span
          className={cn(
            "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
            REVIEW_BADGE[i.reviewStatus],
          )}
        >
          {REVIEW_LABEL[i.reviewStatus]}
        </span>
      ),
    },
    {
      key: "status",
      header: "狀態",
      render: (i) => (
        <StatusToggle
          active={i.isActive}
          onToggle={() => crud.toggleActive(i)}
        />
      ),
    },
    {
      key: "createdAt",
      header: "建立時間",
      className: "text-muted-foreground",
      render: (i) => i.createdAt,
    },
    {
      key: "actions",
      header: "操作",
      headClassName: "text-right",
      render: (i) => (
        <div className="flex items-center justify-end gap-2">
          {i.source === "CREATOR" && i.reviewStatus === "pending" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setReviewingItem(i)}
            >
              審核
            </Button>
          )}
          <AdminRowActions
            onEdit={() => crud.openEdit(i)}
            onDelete={() => handleDelete(i)}
            sortable={{
              onMoveUp: () => crud.moveUp(i.id),
              onMoveDown: () => crud.moveDown(i.id),
              isFirst: i.sortOrder === 1,
              isLast: i.sortOrder === crud.items.length,
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="活動區塊管理"
        action={
          <Button onClick={crud.openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            新增活動
          </Button>
        }
      />

      {/* Tab 切換列 */}
      <div className="mb-4 flex items-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as TabKey)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs font-semibold",
                activeTab === tab.key
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-background text-foreground",
              )}
            >
              {tabCounts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      <AdminTable
        columns={columns}
        items={visibleItems}
        loading={crud.loading}
        error={crud.error}
      />

      {/* 新增活動 modal */}
      <AdminModal
        open={crud.isModalOpen && !crud.editingItem}
        title="新增活動區塊"
        onClose={crud.closeModal}
        onSubmit={handleCreateSubmit}
      >
        <AdminField
          label="活動名稱"
          htmlFor="c-title"
          required
          error={createErrors.title}
        >
          <Input
            id="c-title"
            value={createForm.title}
            onChange={(e) =>
              setCreateForm({ ...createForm, title: e.target.value })
            }
            placeholder="例如：新會員首購 9 折"
          />
        </AdminField>

        <AdminField
          label="連結"
          htmlFor="c-linkUrl"
          required
          error={createErrors.linkUrl}
        >
          <Input
            id="c-linkUrl"
            value={createForm.linkUrl}
            onChange={(e) =>
              setCreateForm({ ...createForm, linkUrl: e.target.value })
            }
            placeholder="例如：/shop"
          />
        </AdminField>

        <AdminField
          label="排序"
          htmlFor="c-sortOrder"
          required
          error={createErrors.sortOrder}
        >
          <Input
            id="c-sortOrder"
            type="number"
            value={createForm.sortOrder}
            onChange={(e) =>
              setCreateForm({ ...createForm, sortOrder: e.target.value })
            }
          />
        </AdminField>

        <div className="flex gap-4">
          <div className="flex-1">
            <AdminField
              label="活動開始時間"
              htmlFor="c-startTime"
              required
              error={createErrors.startTime}
            >
              <BasicDatePicker
                showTime
                value={createForm.startTime}
                onChange={(d) => setCreateForm({ ...createForm, startTime: d })}
                placeholder="請選擇開始時間"
              />
            </AdminField>
          </div>
          <div className="flex-1">
            <AdminField
              label="活動結束時間"
              htmlFor="c-endTime"
              required
              error={createErrors.endTime}
            >
              <BasicDatePicker
                showTime
                value={createForm.endTime}
                onChange={(d) => setCreateForm({ ...createForm, endTime: d })}
                placeholder="請選擇結束時間"
              />
            </AdminField>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <AdminField
              label="上架時間"
              htmlFor="c-publishStartTime"
              required
              error={createErrors.publishStartTime}
            >
              <BasicDatePicker
                showTime
                value={createForm.publishStartTime}
                onChange={(d) =>
                  setCreateForm({ ...createForm, publishStartTime: d })
                }
                placeholder="請選擇上架時間"
              />
            </AdminField>
          </div>
          <div className="flex-1">
            <AdminField
              label="下架時間"
              htmlFor="c-publishEndTime"
              required
              error={createErrors.publishEndTime}
            >
              <BasicDatePicker
                showTime
                value={createForm.publishEndTime}
                onChange={(d) =>
                  setCreateForm({ ...createForm, publishEndTime: d })
                }
                placeholder="請選擇下架時間"
              />
            </AdminField>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <span className="text-sm font-medium">是否啟用</span>
          <Switch
            checked={createForm.isActive}
            onCheckedChange={(v) =>
              setCreateForm({ ...createForm, isActive: v })
            }
          />
        </div>
      </AdminModal>

      {/* 編輯活動 modal */}
      <AdminModal
        open={crud.isModalOpen && !!crud.editingItem}
        title="編輯活動區塊"
        onClose={crud.closeModal}
        onSubmit={handleEditSubmit}
      >
        <AdminField
          label="活動名稱"
          htmlFor="e-title"
          required
          error={editErrors.title}
        >
          <Input
            id="e-title"
            value={editForm.title}
            onChange={(e) =>
              setEditForm({ ...editForm, title: e.target.value })
            }
            placeholder="例如：新會員首購 9 折"
          />
        </AdminField>

        <AdminField
          label="連結"
          htmlFor="e-linkUrl"
          required
          error={editErrors.linkUrl}
        >
          <Input
            id="e-linkUrl"
            value={editForm.linkUrl}
            onChange={(e) =>
              setEditForm({ ...editForm, linkUrl: e.target.value })
            }
            placeholder="例如：/shop"
          />
        </AdminField>

        <AdminField
          label="排序"
          htmlFor="e-sortOrder"
          required
          error={editErrors.sortOrder}
        >
          <Input
            id="e-sortOrder"
            type="number"
            value={editForm.sortOrder}
            onChange={(e) =>
              setEditForm({ ...editForm, sortOrder: e.target.value })
            }
          />
        </AdminField>

        <div className="flex gap-4">
          <div className="flex-1">
            <AdminField
              label="活動開始時間"
              htmlFor="e-startTime"
              required
              error={editErrors.startTime}
            >
              <BasicDatePicker
                showTime
                value={editForm.startTime}
                onChange={(d) => setEditForm({ ...editForm, startTime: d })}
                placeholder="請選擇開始時間"
              />
            </AdminField>
          </div>
          <div className="flex-1">
            <AdminField
              label="活動結束時間"
              htmlFor="e-endTime"
              required
              error={editErrors.endTime}
            >
              <BasicDatePicker
                showTime
                value={editForm.endTime}
                onChange={(d) => setEditForm({ ...editForm, endTime: d })}
                placeholder="請選擇結束時間"
              />
            </AdminField>
          </div>
        </div>

        <AdminField
          label="上架時間"
          htmlFor="e-publishStartTime"
          required
          error={editErrors.publishStartTime}
        >
          <BasicDatePicker
            showTime
            value={editForm.publishStartTime}
            onChange={(d) => setEditForm({ ...editForm, publishStartTime: d })}
            placeholder="請選擇上架時間"
          />
        </AdminField>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <span className="text-sm font-medium">是否啟用</span>
          <Switch
            checked={editForm.isActive}
            onCheckedChange={(v) => setEditForm({ ...editForm, isActive: v })}
          />
        </div>
      </AdminModal>

      {/* 審核 Modal */}
      <Dialog
        open={!!reviewingItem}
        onOpenChange={(open) => !open && setReviewingItem(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>審核創作者活動申請</DialogTitle>
          </DialogHeader>

          {reviewingItem && (
            <div className="space-y-4 py-2">
              <div className="space-y-3 rounded-lg border border-border p-4">
                <Row label="活動名稱" value={reviewingItem.title} />
                <Row
                  label="活動時間"
                  value={
                    reviewingItem.startTime && reviewingItem.endTime
                      ? `${reviewingItem.startTime} ～ ${reviewingItem.endTime}`
                      : "—"
                  }
                />
                {reviewingItem.boothStartTime && reviewingItem.boothEndTime && (
                  <Row
                    label="擺攤時間"
                    value={`${reviewingItem.boothStartTime} ～ ${reviewingItem.boothEndTime}`}
                  />
                )}
                <Row label="地址" value={reviewingItem.address || "—"} />
                <Row label="備註" value={reviewingItem.note || "—"} />
                <Row label="申請日期" value={reviewingItem.createdAt} />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setReviewingItem(null)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              className="gap-1.5"
              onClick={() => reviewingItem && handleReview(reviewingItem, "rejected")}
            >
              <X className="h-4 w-4" />
              拒絕
            </Button>
            <Button
              className="gap-1.5 bg-green-600 hover:bg-green-700"
              onClick={() => reviewingItem && handleReview(reviewingItem, "approved")}
            >
              <Check className="h-4 w-4" />
              通過
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="w-20 shrink-0 text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
