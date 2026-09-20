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
import { mockFeaturedCreators } from "@/mocks/admin/featuredCreators";
import { mockCreators } from "@/mocks/admin/creators";
import type { FeaturedCreator } from "@/types/admin";

interface FormState {
  creatorId: string;
  sortOrder: string;
  isActive: boolean;
}

const emptyForm: FormState = { creatorId: "", sortOrder: "1", isActive: true };

export default function FeaturedCreatorsPage() {
  const crud = useAdminCrud<FeaturedCreator>("fc", mockFeaturedCreators);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const creatorMap = useMemo(() => {
    const map: Record<string, (typeof mockCreators)[number]> = {};
    mockCreators.forEach((c) => (map[c.id] = c));
    return map;
  }, []);

  useEffect(() => {
    if (!crud.isModalOpen) return;
    if (crud.editingItem) {
      setForm({
        creatorId: crud.editingItem.creatorId,
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
    if (!form.creatorId) next.creatorId = "請選擇創作者";
    if (form.sortOrder === "" || Number.isNaN(Number(form.sortOrder)))
      next.sortOrder = "排序必須是數字";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    crud.submit({
      creatorId: form.creatorId,
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
    });
  };

  const handleDelete = (item: FeaturedCreator) => {
    const name = creatorMap[item.creatorId]?.name ?? "此創作者";
    if (window.confirm(`確定要將「${name}」移出熱門創作者嗎？`)) {
      crud.remove(item.id);
    }
  };

  const columns: AdminTableColumn<FeaturedCreator>[] = [
    { key: "sortOrder", header: "排序", className: "w-16 text-muted-foreground", render: (i) => i.sortOrder },
    {
      key: "avatar",
      header: "頭像",
      className: "w-16",
      render: (i) => {
        const c = creatorMap[i.creatorId];
        // eslint-disable-next-line @next/next/no-img-element
        return c ? (
          <img
            src={c.avatarUrl}
            alt={c.name}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          "—"
        );
      },
    },
    {
      key: "name",
      header: "創作者名稱",
      render: (i) => (
        <span className="font-medium">{creatorMap[i.creatorId]?.name ?? "（已刪除）"}</span>
      ),
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
        title="熱門創作者管理"
        description="設定前台要顯示的熱門創作者與顯示順序。"
        action={
          <Button onClick={crud.openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            新增熱門創作者
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
        title={crud.editingItem ? "編輯熱門創作者" : "新增熱門創作者"}
        onClose={crud.closeModal}
        onSubmit={handleSubmit}
      >
        <AdminField label="創作者" required error={errors.creatorId}>
          <Select
            value={form.creatorId}
            onValueChange={(v) => setForm({ ...form, creatorId: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="請選擇創作者" />
            </SelectTrigger>
            <SelectContent>
              {mockCreators.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
