"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable, type AdminTableColumn } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminField } from "@/components/admin/AdminField";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { StatusToggle } from "@/components/admin/StatusToggle";
import { useAdminCrud } from "@/lib/admin/useAdminCrud";
import { mockActivities } from "@/mocks/admin/activities";
import type { Activity } from "@/types/admin";

interface FormState {
  title: string;
  linkUrl: string;
  imageUrl: string;
  sortOrder: string;
  isActive: boolean;
}

const emptyForm: FormState = {
  title: "",
  linkUrl: "",
  imageUrl: "",
  sortOrder: "1",
  isActive: true,
};

export default function ActivitiesPage() {
  const crud = useAdminCrud<Activity>("a", mockActivities);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!crud.isModalOpen) return;
    if (crud.editingItem) {
      const e = crud.editingItem;
      setForm({
        title: e.title,
        linkUrl: e.linkUrl,
        imageUrl: e.imageUrl,
        sortOrder: String(e.sortOrder),
        isActive: e.isActive,
      });
    } else {
      setForm({ ...emptyForm, sortOrder: String(crud.items.length + 1) });
    }
    setErrors({});
  }, [crud.isModalOpen, crud.editingItem, crud.items.length]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = "請輸入活動名稱";
    if (!form.linkUrl.trim()) next.linkUrl = "請輸入連結";
    if (!form.imageUrl.trim()) next.imageUrl = "請輸入圖片網址";
    if (form.sortOrder === "" || Number.isNaN(Number(form.sortOrder)))
      next.sortOrder = "排序必須是數字";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    crud.submit({
      title: form.title.trim(),
      linkUrl: form.linkUrl.trim(),
      imageUrl: form.imageUrl.trim(),
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
    });
  };

  const handleDelete = (item: Activity) => {
    if (window.confirm(`確定要刪除「${item.title}」嗎？`)) {
      crud.remove(item.id);
    }
  };

  const columns: AdminTableColumn<Activity>[] = [
    { key: "sortOrder", header: "排序", className: "w-16 text-muted-foreground", render: (i) => i.sortOrder },
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
    { key: "title", header: "活動名稱", render: (i) => <span className="font-medium">{i.title}</span> },
    {
      key: "linkUrl",
      header: "連結",
      className: "max-w-[160px] truncate text-muted-foreground",
      render: (i) => i.linkUrl,
    },
    { key: "status", header: "狀態", render: (i) => <StatusToggle active={i.isActive} onToggle={() => crud.toggleActive(i)} /> },
    { key: "createdAt", header: "建立時間", className: "text-muted-foreground", render: (i) => i.createdAt },
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

      <AdminModal
        open={crud.isModalOpen}
        title={crud.editingItem ? "編輯活動區塊" : "新增活動區塊"}
        onClose={crud.closeModal}
        onSubmit={handleSubmit}
      >
        <AdminField label="活動名稱" htmlFor="title" required error={errors.title}>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="例如：新會員首購 9 折"
          />
        </AdminField>

        <AdminField label="連結" htmlFor="linkUrl" required error={errors.linkUrl}>
          <Input
            id="linkUrl"
            value={form.linkUrl}
            onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
            placeholder="例如：/shop"
          />
        </AdminField>

        <AdminField label="圖片網址" htmlFor="imageUrl" required error={errors.imageUrl}>
          <Input
            id="imageUrl"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="https://..."
          />
        </AdminField>

        <AdminField label="排序" htmlFor="sortOrder" required error={errors.sortOrder}>
          <Input
            id="sortOrder"
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          />
        </AdminField>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <span className="text-sm font-medium">是否啟用</span>
          <Switch
            checked={form.isActive}
            onCheckedChange={(v) => setForm({ ...form, isActive: v })}
          />
        </div>
      </AdminModal>
    </div>
  );
}
