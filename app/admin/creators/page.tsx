"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Flame } from "lucide-react"; 
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
  isPopular: boolean; 
}

const emptyForm: FormState = {
  name: "",
  categoryId: "",
  specialty: "",
  avatarUrl: "",
  sortOrder: "1",
  isActive: true,
  isPopular: false, 
};

export default function CreatorsPage() {
  const getInitialCreators = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_creators_data");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return mockCreators;
        }
      }
    }
    return mockCreators;
  };

  const crud = useAdminCrud<Creator>("c", getInitialCreators());
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (crud.items && crud.items.length > 0) {
      localStorage.setItem("admin_creators_data", JSON.stringify(crud.items));
    }
  }, [crud.items]);

  const categoryNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    mockCreatorCategories.forEach((c) => (map[c.id] = c.name));
    return map;
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return crud.items;
    return crud.items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [crud.items, searchQuery]);

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
        isPopular: (e as any).isPopular ?? false,
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
      isPopular: form.isPopular, 
    } as any);
  };

  const handleDelete = (item: Creator) => {
    if (window.confirm(`確定要刪除「${item.name}」嗎？`)) {
      crud.remove(item.id);
    }
  };

  // 修正狀態切換
  const handleToggleActive = (item: Creator) => {
    crud.submit({
      ...item,
      isActive: !item.isActive,
    } as any);
  };

  const columns: AdminTableColumn<Creator>[] = [
    {
      key: "avatar",
      header: "頭像",
      className: "w-16",
      render: (i) => (
        <div className="relative h-12 w-12">
          <img
            src={i.avatarUrl}
            alt={i.name}
            className="h-12 w-12 rounded-full object-cover"
          />
          {(i as any).isPopular && (

            <span className="absolute -bottom-0.5 -right-0.5 bg-background border border-border/50 rounded-full p-0.5 shadow-sm flex items-center justify-center">
              <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500/20" />
            </span>
          )}
        </div>
      ),
    },
    { 
      key: "name", 
      header: "創作者名稱", 
      render: (i) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{i.name}</span>
        </div>
      ) 
    },
    {
      key: "category",
      header: "類別",
      className: "text-muted-foreground",
      render: (i) => categoryNameMap[i.categoryId] ?? "—",
    },
    { key: "specialty", header: "專長", className: "text-muted-foreground", render: (i) => i.specialty || "—" },
    { key: "status", header: "狀態", render: (i) => <StatusToggle active={i.isActive} onToggle={() => handleToggleActive(i)} /> },
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
    <div className="space-y-4">
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

      <div className="max-w-md">
        <Input
          type="text"
          placeholder="搜尋創作者名稱..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-background/50 border border-border/50"
        />
      </div>

      <AdminTable
        columns={columns}
        items={filteredItems}
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

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <span className="text-sm font-medium">是否啟用</span>
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) => setForm({ ...form, isActive: v })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <span className="text-sm font-medium">設為熱門創作者</span>
            <Switch
              checked={form.isPopular}
              onCheckedChange={(v) => setForm({ ...form, isPopular: v })}
            />
          </div>
        </div>
      </AdminModal>
    </div>
  );
}