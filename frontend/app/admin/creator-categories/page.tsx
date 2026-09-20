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
import { mockCreatorCategories } from "@/mocks/admin/creatorCategories";
import type { CreatorCategory } from "@/types/admin";

interface FormState {
  name: string;
  sortOrder: string;
  isActive: boolean;
}

const emptyForm: FormState = { name: "", sortOrder: "1", isActive: true };

export default function CreatorCategoriesPage() {
  const crud = useAdminCrud<CreatorCategory>("cc", mockCreatorCategories);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!crud.isModalOpen) return;
    if (crud.editingItem) {
      setForm({
        name: crud.editingItem.name,
        sortOrder: String(crud.editingItem.sortOrder),
        isActive: crud.editingItem.isActive,
      });
    } else {
      setForm({ ...emptyForm, sortOrder: String(crud.items.length + 1) });
    }
    setErrors({});
  }, [crud.isModalOpen, crud.editingItem, crud.items.length]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "請輸入類別名稱";
    if (form.sortOrder === "" || Number.isNaN(Number(form.sortOrder)))
      next.sortOrder = "排序必須是數字";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    crud.submit({
      name: form.name.trim(),
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
    });
  };

  const handleDelete = (item: CreatorCategory) => {
    if (window.confirm(`確定要刪除「${item.name}」嗎？`)) {
      crud.remove(item.id);
    }
  };

  const columns: AdminTableColumn<CreatorCategory>[] = [
    { key: "sortOrder", header: "排序", className: "w-16 text-muted-foreground", render: (i) => i.sortOrder },
    { key: "name", header: "類別名稱", render: (i) => <span className="font-medium">{i.name}</span> },
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
        title="創作者類別管理"
        description="管理創作者分類，可調整排序與啟用狀態。"
        action={
          <Button onClick={crud.openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            新增類別
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
        title={crud.editingItem ? "編輯創作者類別" : "新增創作者類別"}
        onClose={crud.closeModal}
        onSubmit={handleSubmit}
      >
        <AdminField label="類別名稱" htmlFor="name" required error={errors.name}>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="例如：療癒插畫"
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
