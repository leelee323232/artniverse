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
import { FeatureUnavailableDialog } from "@/components/common/FeatureUnavailableDialog";
import { AdminField } from "@/components/admin/AdminField";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { StatusToggle } from "@/components/admin/StatusToggle";
import { useAdminCrud } from "@/lib/admin/useAdminCrud";
import { mockProductCategories } from "@/mocks/admin/productCategories";
import type { ProductCategory } from "@/types/admin";

interface FormState {
  name: string;
  sortOrder: string;
  isActive: boolean;
}

const emptyForm: FormState = { name: "", sortOrder: "1", isActive: true };

export default function ProductCategoriesPage() {
  const crud = useAdminCrud<ProductCategory>("pc", mockProductCategories);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [featureUnavailableOpen, setFeatureUnavailableOpen] = useState(false);
  // TEMP: 原始流程就地註解保留，串接完成後再恢復。
  const showFeatureUnavailable = () => setFeatureUnavailableOpen(true);

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
    // TEMP: 趕上線期間暫時以阻擋視窗代替；恢復時移除提示呼叫，取消下方原始邏輯註解。
    showFeatureUnavailable();

    // 原始邏輯（暫時停用，請保留）：
    // if (!validate()) return;
    // crud.submit({
    //   name: form.name.trim(),
    //   sortOrder: Number(form.sortOrder),
    //   isActive: form.isActive,
    // });
  };

  const handleDelete = (item: ProductCategory) => {
    // TEMP: 趕上線期間暫時以阻擋視窗代替；恢復時移除提示呼叫，取消下方原始邏輯註解。
    showFeatureUnavailable();

    // 原始邏輯（暫時停用，請保留）：
    // if (window.confirm(`確定要刪除「${item.name}」嗎？`)) {
    //   crud.remove(item.id);
    // }
  };

  const columns: AdminTableColumn<ProductCategory>[] = [
    {
      key: "sortOrder",
      header: "排序",
      className: "w-16 text-muted-foreground",
      render: (i) => i.sortOrder,
    },
    {
      key: "name",
      header: "類別名稱",
      render: (i) => <span className="font-medium">{i.name}</span>,
    },
    {
      key: "status",
      header: "狀態",
      render: (i) => (
        <StatusToggle
          active={i.isActive}
          onToggle={/* TEMP: 暫時以阻擋視窗代替；恢復時改回 () => crud.toggleActive(i) */ showFeatureUnavailable}
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
          onEdit={/* TEMP: 暫時以阻擋視窗代替；恢復時改回 () => crud.openEdit(i) */ showFeatureUnavailable}
          onDelete={() => handleDelete(i)}
          sortable={{
            // TEMP: 原本 onMoveUp: () => crud.moveUp(i.id)，恢復時取消下行註解並移除提示綁定。
            // onMoveUp: () => crud.moveUp(i.id),
            onMoveUp: showFeatureUnavailable,
            // TEMP: 原本 onMoveDown: () => crud.moveDown(i.id)，恢復時取消下行註解並移除提示綁定。
            // onMoveDown: () => crud.moveDown(i.id),
            onMoveDown: showFeatureUnavailable,
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
        title="商品類別管理"
        description="管理前台商品分類，可調整排序與啟用狀態。"
        action={
          <Button onClick={/* TEMP: 暫時以阻擋視窗代替；恢復時改回 crud.openCreate */ showFeatureUnavailable} className="gap-2">
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

      <FeatureUnavailableDialog
        open={featureUnavailableOpen}
        onOpenChange={setFeatureUnavailableOpen}
      />

      <AdminModal
        open={crud.isModalOpen}
        title={crud.editingItem ? "編輯產品類別" : "新增產品類別"}
        onClose={crud.closeModal}
        onSubmit={handleSubmit}
      >
        <AdminField
          label="類別名稱"
          htmlFor="name"
          required
          error={errors.name}
        >
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="例如：戶外用品"
          />
        </AdminField>

        <AdminField
          label="排序"
          htmlFor="sortOrder"
          required
          error={errors.sortOrder}
        >
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
