"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable, type AdminTableColumn } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminField } from "@/components/admin/AdminField";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { StatusToggle } from "@/components/admin/StatusToggle";
import { useAdminCrud } from "@/lib/admin/useAdminCrud";
import { mockCreators } from "@/mocks/admin/creators";
import { mockCreatorCategories } from "@/mocks/admin/creatorCategories";
import type { Creator } from "@/types/admin";

interface FormState {
  name: string;
  categoryId: string;
  specialty: string;
  avatarUrl: string;
  sortOrder: string;
  isActive: boolean;
}

const emptyForm: FormState = {
  name: "",
  categoryId: "",
  specialty: "",
  avatarUrl: "",
  sortOrder: "1",
  isActive: true,
};

export default function CreatorsPage() {
  const crud = useAdminCrud<Creator>("c", mockCreators);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categoryNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    mockCreatorCategories.forEach((c) => (map[c.id] = c.name));
    return map;
  }, []);

  useEffect(() => {
    if (!crud.isModalOpen) return;
    if (crud.editingItem) {
      const e = crud.editingItem;
      setForm({
        name: e.name,
        categoryId: e.categoryId,
        specialty: e.specialty,
        avatarUrl: e.avatarUrl,
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
    if (!form.name.trim()) next.name = "請輸入創作者名稱";
    if (!form.categoryId) next.categoryId = "請選擇類別";
    if (!form.avatarUrl.trim()) next.avatarUrl = "請輸入頭像網址";
    if (form.sortOrder === "" || Number.isNaN(Number(form.sortOrder)))
      next.sortOrder = "排序必須是數字";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    crud.submit({
      name: form.name.trim(),
      categoryId: form.categoryId,
      specialty: form.specialty.trim(),
      avatarUrl: form.avatarUrl.trim(),
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
    });
  };

  const handleDelete = (item: Creator) => {
    if (window.confirm(`確定要刪除「${item.name}」嗎？`)) {
      crud.remove(item.id);
    }
  };

  const columns: AdminTableColumn<Creator>[] = [
    {
      key: "avatar",
      header: "頭像",
      className: "w-16",
      render: (i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={i.avatarUrl}
          alt={i.name}
          className="h-12 w-12 rounded-full object-cover"
        />
      ),
    },
    { key: "name", header: "創作者名稱", render: (i) => <span className="font-medium">{i.name}</span> },
    {
      key: "category",
      header: "類別",
      className: "text-muted-foreground",
      render: (i) => categoryNameMap[i.categoryId] ?? "—",
    },
    { key: "specialty", header: "專長", className: "text-muted-foreground", render: (i) => i.specialty || "—" },
    { key: "status", header: "狀態", render: (i) => <StatusToggle active={i.isActive} onToggle={() => crud.toggleActive(i)} /> },
    {
      key: "actions",
      header: "操作",
      headClassName: "text-right",
      render: (i) => (
        <AdminRowActions
          onEdit={() => crud.openEdit(i)}
          onDelete={() => handleDelete(i)}
        />
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="創作者管理"
        description="管理平台創作者資料。"
        action={
          <Button onClick={crud.openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            新增創作者
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
        title={crud.editingItem ? "編輯創作者" : "新增創作者"}
        onClose={crud.closeModal}
        onSubmit={handleSubmit}
      >
        <AdminField label="創作者名稱" htmlFor="name" required error={errors.name}>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="例如：小夢創作室"
          />
        </AdminField>

        <AdminField label="類別" required error={errors.categoryId}>
          <Select
            value={form.categoryId}
            onValueChange={(v) => setForm({ ...form, categoryId: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="請選擇類別" />
            </SelectTrigger>
            <SelectContent>
              {mockCreatorCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AdminField>

        <AdminField label="專長" htmlFor="specialty">
          <Input
            id="specialty"
            value={form.specialty}
            onChange={(e) => setForm({ ...form, specialty: e.target.value })}
            placeholder="例如：療癒插畫"
          />
        </AdminField>

        <AdminField label="頭像網址" htmlFor="avatarUrl" required error={errors.avatarUrl}>
          <Input
            id="avatarUrl"
            value={form.avatarUrl}
            onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
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
