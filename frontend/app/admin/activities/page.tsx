"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AdminTable,
  type AdminTableColumn,
} from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminField } from "@/components/admin/AdminField";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { StatusToggle } from "@/components/admin/StatusToggle";
import { useAdminCrud } from "@/lib/admin/useAdminCrud";
import { mockActivities } from "@/mocks/admin/activities";
import type { Activity } from "@/types/admin";
import { BasicDatePicker } from "@/components/ui/date-picker";

interface CreateFormState {
  title: string;
  linkUrl: string;
  imageUrl: string;
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
  imageUrl: "",
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
  imageUrl: string;
  sortOrder: string;
  isActive: boolean;
  startTime: Date | null;
  endTime: Date | null;
  publishStartTime: Date | null;
}

const emptyEditForm: EditFormState = {
  title: "",
  linkUrl: "",
  imageUrl: "",
  sortOrder: "1",
  isActive: true,
  startTime: null,
  endTime: null,
  publishStartTime: null,
};

export default function ActivitiesPage() {
  const crud = useAdminCrud<Activity>("a", mockActivities);
  const [createForm, setCreateForm] = useState<CreateFormState>(emptyCreateForm);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [editForm, setEditForm] = useState<EditFormState>(emptyEditForm);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const parseDate = (s: string | null) => (s ? new Date(s.replace("/", "-").replace("/", "-")) : null);

  useEffect(() => {
    if (!crud.isModalOpen || crud.editingItem) return;
    setCreateForm({ ...emptyCreateForm, sortOrder: String(crud.items.length + 1) });
    setCreateErrors({});
  }, [crud.isModalOpen, crud.editingItem, crud.items.length]);

  useEffect(() => {
    if (!crud.isModalOpen || !crud.editingItem) return;
    const e = crud.editingItem;
    setEditForm({
      title: e.title,
      linkUrl: e.linkUrl,
      imageUrl: e.imageUrl,
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
    if (!createForm.imageUrl.trim()) next.imageUrl = "請輸入圖片網址";
    if (createForm.sortOrder === "" || Number.isNaN(Number(createForm.sortOrder)))
      next.sortOrder = "排序必須是數字";
    if (!createForm.startTime) next.startTime = "請選擇活動開始時間";
    if (!createForm.endTime) next.endTime = "請選擇活動結束時間";
    if (createForm.startTime && createForm.endTime && createForm.endTime <= createForm.startTime)
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
    if (!editForm.imageUrl.trim()) next.imageUrl = "請輸入圖片網址";
    if (editForm.sortOrder === "" || Number.isNaN(Number(editForm.sortOrder)))
      next.sortOrder = "排序必須是數字";
    if (!editForm.startTime) next.startTime = "請選擇活動開始時間";
    if (!editForm.endTime) next.endTime = "請選擇活動結束時間";
    if (editForm.startTime && editForm.endTime && editForm.endTime <= editForm.startTime)
      next.endTime = "結束時間必須晚於開始時間";
    if (!editForm.publishStartTime) next.publishStartTime = "請選擇上架時間";
    setEditErrors(next);
    return Object.keys(next).length === 0;
  };

  const toDateString = (d: Date | null) =>
    d ? `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` : null;

  const handleCreateSubmit = () => {
    if (!validateCreate()) return;
    crud.submit({
      title: createForm.title.trim(),
      linkUrl: createForm.linkUrl.trim(),
      imageUrl: createForm.imageUrl.trim(),
      sortOrder: Number(createForm.sortOrder),
      isActive: createForm.isActive,
      startTime: toDateString(createForm.startTime),
      endTime: toDateString(createForm.endTime),
      publishStartTime: toDateString(createForm.publishStartTime),
      publishEndTime: toDateString(createForm.publishEndTime),
    });
  };

  const handleEditSubmit = () => {
    if (!validateEdit()) return;
    crud.submit({
      title: editForm.title.trim(),
      linkUrl: editForm.linkUrl.trim(),
      imageUrl: editForm.imageUrl.trim(),
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

  const columns: AdminTableColumn<Activity>[] = [
    {
      key: "sortOrder",
      header: "排序",
      className: "w-16 text-muted-foreground",
      render: (i) => i.sortOrder,
    },
    {
      key: "image",
      header: "圖片",
      className: "w-32",
      render: (i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={i.imageUrl}
          alt={i.title}
          className="h-12 w-28 rounded-md object-cover"
        />
      ),
    },
    {
      key: "title",
      header: "活動名稱",
      render: (i) => <span className="font-medium">{i.title}</span>,
    },
    {
      key: "linkUrl",
      header: "連結",
      className: "max-w-[160px] truncate text-muted-foreground",
      render: (i) => i.linkUrl,
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
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="活動區塊管理"
        description="管理前台活動 banner / 促銷區塊，可調整顯示排序。"
        action={
          <Button onClick={crud.openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            新增活動區塊
          </Button>
        }
      />

      <AdminTable
        columns={columns}
        items={crud.items}
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
        <AdminField label="活動名稱" htmlFor="c-title" required error={createErrors.title}>
          <Input
            id="c-title"
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
            placeholder="例如：新會員首購 9 折"
          />
        </AdminField>

        <AdminField label="連結" htmlFor="c-linkUrl" required error={createErrors.linkUrl}>
          <Input
            id="c-linkUrl"
            value={createForm.linkUrl}
            onChange={(e) => setCreateForm({ ...createForm, linkUrl: e.target.value })}
            placeholder="例如：/shop"
          />
        </AdminField>

        <AdminField label="圖片網址" htmlFor="c-imageUrl" required error={createErrors.imageUrl}>
          <Input
            id="c-imageUrl"
            value={createForm.imageUrl}
            onChange={(e) => setCreateForm({ ...createForm, imageUrl: e.target.value })}
            placeholder="https://..."
          />
        </AdminField>

        <AdminField label="排序" htmlFor="c-sortOrder" required error={createErrors.sortOrder}>
          <Input
            id="c-sortOrder"
            type="number"
            value={createForm.sortOrder}
            onChange={(e) => setCreateForm({ ...createForm, sortOrder: e.target.value })}
          />
        </AdminField>

        <div className="flex gap-4">
          <div className="flex-1">
            <AdminField label="活動開始時間" htmlFor="c-startTime" required error={createErrors.startTime}>
              <BasicDatePicker
                showTime
                value={createForm.startTime}
                onChange={(d) => setCreateForm({ ...createForm, startTime: d })}
                placeholder="請選擇開始時間"
              />
            </AdminField>
          </div>
          <div className="flex-1">
            <AdminField label="活動結束時間" htmlFor="c-endTime" required error={createErrors.endTime}>
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
            <AdminField label="上架時間" htmlFor="c-publishStartTime" required error={createErrors.publishStartTime}>
              <BasicDatePicker
                showTime
                value={createForm.publishStartTime}
                onChange={(d) => setCreateForm({ ...createForm, publishStartTime: d })}
                placeholder="請選擇上架時間"
              />
            </AdminField>
          </div>
          <div className="flex-1">
            <AdminField label="下架時間" htmlFor="c-publishEndTime" required error={createErrors.publishEndTime}>
              <BasicDatePicker
                showTime
                value={createForm.publishEndTime}
                onChange={(d) => setCreateForm({ ...createForm, publishEndTime: d })}
                placeholder="請選擇下架時間"
              />
            </AdminField>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <span className="text-sm font-medium">是否啟用</span>
          <Switch
            checked={createForm.isActive}
            onCheckedChange={(v) => setCreateForm({ ...createForm, isActive: v })}
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
        <AdminField label="活動名稱" htmlFor="e-title" required error={editErrors.title}>
          <Input
            id="e-title"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            placeholder="例如：新會員首購 9 折"
          />
        </AdminField>

        <AdminField label="連結" htmlFor="e-linkUrl" required error={editErrors.linkUrl}>
          <Input
            id="e-linkUrl"
            value={editForm.linkUrl}
            onChange={(e) => setEditForm({ ...editForm, linkUrl: e.target.value })}
            placeholder="例如：/shop"
          />
        </AdminField>

        <AdminField label="圖片網址" htmlFor="e-imageUrl" required error={editErrors.imageUrl}>
          <Input
            id="e-imageUrl"
            value={editForm.imageUrl}
            onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
            placeholder="https://..."
          />
        </AdminField>

        <AdminField label="排序" htmlFor="e-sortOrder" required error={editErrors.sortOrder}>
          <Input
            id="e-sortOrder"
            type="number"
            value={editForm.sortOrder}
            onChange={(e) => setEditForm({ ...editForm, sortOrder: e.target.value })}
          />
        </AdminField>

        <div className="flex gap-4">
          <div className="flex-1">
            <AdminField label="活動開始時間" htmlFor="e-startTime" required error={editErrors.startTime}>
              <BasicDatePicker
                showTime
                value={editForm.startTime}
                onChange={(d) => setEditForm({ ...editForm, startTime: d })}
                placeholder="請選擇開始時間"
              />
            </AdminField>
          </div>
          <div className="flex-1">
            <AdminField label="活動結束時間" htmlFor="e-endTime" required error={editErrors.endTime}>
              <BasicDatePicker
                showTime
                value={editForm.endTime}
                onChange={(d) => setEditForm({ ...editForm, endTime: d })}
                placeholder="請選擇結束時間"
              />
            </AdminField>
          </div>
        </div>

        <AdminField label="上架時間" htmlFor="e-publishStartTime" required error={editErrors.publishStartTime}>
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
    </div>
  );
}
