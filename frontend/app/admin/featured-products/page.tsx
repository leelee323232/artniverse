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
import { mockFeaturedProducts } from "@/mocks/admin/featuredProducts";
import { mockProducts } from "@/mocks/admin/products";
import type { FeaturedProduct } from "@/types/admin";

interface FormState {
  productId: string;
  sortOrder: string;
  isActive: boolean;
}

const emptyForm: FormState = { productId: "", sortOrder: "1", isActive: true };

export default function FeaturedProductsPage() {
  const crud = useAdminCrud<FeaturedProduct>("fp", mockFeaturedProducts);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const productMap = useMemo(() => {
    const map: Record<string, (typeof mockProducts)[number]> = {};
    mockProducts.forEach((p) => (map[p.id] = p));
    return map;
  }, []);

  useEffect(() => {
    if (!crud.isModalOpen) return;
    if (crud.editingItem) {
      setForm({
        productId: crud.editingItem.productId,
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
    if (!form.productId) next.productId = "請選擇商品";
    if (form.sortOrder === "" || Number.isNaN(Number(form.sortOrder)))
      next.sortOrder = "排序必須是數字";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    crud.submit({
      productId: form.productId,
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
    });
  };

  const handleDelete = (item: FeaturedProduct) => {
    const name = productMap[item.productId]?.name ?? "此商品";
    if (window.confirm(`確定要將「${name}」移出熱門商品嗎？`)) {
      crud.remove(item.id);
    }
  };

  const columns: AdminTableColumn<FeaturedProduct>[] = [
    { key: "sortOrder", header: "排序", className: "w-16 text-muted-foreground", render: (i) => i.sortOrder },
    {
      key: "image",
      header: "圖片",
      className: "w-16",
      render: (i) => {
        const p = productMap[i.productId];
        // eslint-disable-next-line @next/next/no-img-element
        return p ? (
          <img
            src={p.imageUrl}
            alt={p.name}
            className="h-12 w-12 rounded-md object-cover"
          />
        ) : (
          "—"
        );
      },
    },
    {
      key: "name",
      header: "商品名稱",
      render: (i) => (
        <span className="font-medium">{productMap[i.productId]?.name ?? "（已刪除）"}</span>
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
        title="熱門商品管理"
        description="設定前台要顯示的熱門商品與顯示順序。"
        action={
          <Button onClick={crud.openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            新增熱門商品
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
        title={crud.editingItem ? "編輯熱門商品" : "新增熱門商品"}
        onClose={crud.closeModal}
        onSubmit={handleSubmit}
      >
        <AdminField label="商品" required error={errors.productId}>
          <Select
            value={form.productId}
            onValueChange={(v) => setForm({ ...form, productId: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="請選擇商品" />
            </SelectTrigger>
            <SelectContent>
              {mockProducts.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
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
