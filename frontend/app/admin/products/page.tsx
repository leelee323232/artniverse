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
import { mockProducts } from "@/mocks/admin/products";
import { mockProductCategories } from "@/mocks/admin/productCategories";
import type { Product } from "@/types/admin";

interface FormState {
  name: string;
  categoryId: string;
  price: string;
  stock: string;
  imageUrl: string;
  sortOrder: string;
  isActive: boolean;
}

const emptyForm: FormState = {
  name: "",
  categoryId: "",
  price: "0",
  stock: "0",
  imageUrl: "",
  sortOrder: "1",
  isActive: true,
};

export default function ProductsPage() {
  const crud = useAdminCrud<Product>("p", mockProducts);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categoryNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    mockProductCategories.forEach((c) => (map[c.id] = c.name));
    return map;
  }, []);

  useEffect(() => {
    if (!crud.isModalOpen) return;
    if (crud.editingItem) {
      const e = crud.editingItem;
      setForm({
        name: e.name,
        categoryId: e.categoryId,
        price: String(e.price),
        stock: String(e.stock),
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
    if (!form.name.trim()) next.name = "請輸入商品名稱";
    if (!form.categoryId) next.categoryId = "請選擇類別";
    if (!form.imageUrl.trim()) next.imageUrl = "請輸入圖片網址";
    if (Number.isNaN(Number(form.price))) next.price = "價格必須是數字";
    if (Number.isNaN(Number(form.stock))) next.stock = "庫存必須是數字";
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
      price: Number(form.price),
      stock: Number(form.stock),
      imageUrl: form.imageUrl.trim(),
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
    });
  };

  const handleDelete = (item: Product) => {
    if (window.confirm(`確定要刪除「${item.name}」嗎？`)) {
      crud.remove(item.id);
    }
  };

  const columns: AdminTableColumn<Product>[] = [
    {
      key: "image",
      header: "圖片",
      className: "w-16",
      render: (i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={i.imageUrl}
          alt={i.name}
          className="h-12 w-12 rounded-md object-cover"
        />
      ),
    },
    { key: "name", header: "商品名稱", render: (i) => <span className="font-medium">{i.name}</span> },
    {
      key: "category",
      header: "類別",
      className: "text-muted-foreground",
      render: (i) => categoryNameMap[i.categoryId] ?? "—",
    },
    { key: "price", header: "價格", render: (i) => `NT$ ${i.price}` },
    { key: "stock", header: "庫存", className: "text-muted-foreground", render: (i) => i.stock },
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
        title="產品管理"
        description="管理平台上架商品。"
        action={
          <Button onClick={crud.openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            新增商品
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
        title={crud.editingItem ? "編輯商品" : "新增商品"}
        onClose={crud.closeModal}
        onSubmit={handleSubmit}
      >
        <AdminField label="商品名稱" htmlFor="name" required error={errors.name}>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="例如：星空露營燈"
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
              {mockProductCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AdminField>

        <div className="grid grid-cols-2 gap-3">
          <AdminField label="價格" htmlFor="price" error={errors.price}>
            <Input
              id="price"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </AdminField>
          <AdminField label="庫存" htmlFor="stock" error={errors.stock}>
            <Input
              id="stock"
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </AdminField>
        </div>

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
