"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, FileText, ImagePlus, Plus, Upload, X } from "lucide-react";
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
import {
  AdminTable,
  type AdminTableColumn,
} from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminField } from "@/components/admin/AdminField";
import { Badge } from "@/components/ui/badge";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { StatusToggle } from "@/components/admin/StatusToggle";
import { useAdminCrud } from "@/lib/admin/useAdminCrud";
import { mockProducts } from "@/mocks/admin/products";
import { mockProductCategories } from "@/mocks/admin/productCategories";
import type { Product, ProductFile, ProductType } from "@/types/admin";
import {
  AUCTION_STATUS_LABEL,
  PRESALE_STATUS_LABEL,
  formatProductDateTime,
  getAuctionPrices,
  getAuctionStatus,
  getPresaleProgress,
  getPresaleStatus,
} from "@/lib/products/status";

const PRODUCT_TABS: { id: ProductType; label: string }[] = [
  { id: "general", label: "一般商品" },
  { id: "auction", label: "競標商品" },
  { id: "presale", label: "預售商品" },
];

const PRESALE_PIN_ORDER: Record<string, number> = {
  success: 0,
  failed: 1,
  live: 2,
  upcoming: 3,
};

const AUCTION_BADGE_CLASS = {
  live: "bg-amber-500/15 text-amber-500 hover:bg-amber-500/15",
  upcoming: "bg-sky-500/15 text-sky-500 hover:bg-sky-500/15",
  ended: "bg-muted text-muted-foreground hover:bg-muted",
} as const;

const PRESALE_BADGE_CLASS = {
  live: "bg-violet-500/15 text-violet-400 hover:bg-violet-500/15",
  upcoming: "bg-sky-500/15 text-sky-500 hover:bg-sky-500/15",
  success: "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/15",
  failed: "bg-muted text-muted-foreground hover:bg-muted",
} as const;

interface FormState {
  name: string;
  categoryId: string;
  price: string;
  stock: string;
  image: string;
  imageFile: File | null;
  templateFile: ProductFile | null;
  sortOrder: string;
  isActive: boolean;
  description: string;
}

const emptyForm: FormState = {
  name: "",
  categoryId: "",
  price: "0",
  stock: "0",
  image: "",
  imageFile: null,
  description: "",
  templateFile: null,
  sortOrder: "1",
  isActive: true,
};

export default function ProductsPage() {
  const crud = useAdminCrud<Product>("p", mockProducts);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [productTab, setProductTab] = useState<ProductType>("general");

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
        image: e.image,
        imageFile: null,
        templateFile: e.templateFile ?? null,
        sortOrder: String(e.sortOrder),
        isActive: e.isActive,
        description: e.description ?? "",
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
    if (!form.image && !form.imageFile) next.image = "請上傳商品圖片";
    if (Number.isNaN(Number(form.price))) next.price = "價格必須是數字";
    if (Number.isNaN(Number(form.stock))) next.stock = "庫存必須是數字";
    if (form.sortOrder === "" || Number.isNaN(Number(form.sortOrder)))
      next.sortOrder = "排序必須是數字";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const imageUrl = form.imageFile
      ? URL.createObjectURL(form.imageFile)
      : form.image;
    crud.submit({
      name: form.name.trim(),
      categoryId: form.categoryId,
      price: Number(form.price),
      stock: Number(form.stock),
      image: imageUrl,
      description: form.description.trim(),
      templateFile: form.templateFile ?? undefined,
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
      productType: crud.editingItem?.productType ?? productTab,
    });
  };

  const handleDelete = (item: Product) => {
    if (window.confirm(`確定要刪除「${item.name}」嗎？`)) {
      crud.remove(item.id);
    }
  };

  const imageColumn: AdminTableColumn<Product> = {
    key: "image",
    header: "圖片",
    className: "w-16",
    render: (i) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={i.image}
        alt={i.name}
        className="h-12 w-12 rounded-md object-cover"
      />
    ),
  };
  const nameColumn: AdminTableColumn<Product> = {
    key: "name",
    header: "商品名稱",
    render: (i) => <span className="font-medium">{i.name}</span>,
  };
  const categoryColumn: AdminTableColumn<Product> = {
    key: "category",
    header: "類別",
    className: "text-muted-foreground",
    render: (i) => categoryNameMap[i.categoryId] ?? "—",
  };
  const actionsColumn: AdminTableColumn<Product> = {
    key: "actions",
    header: "操作",
    headClassName: "text-right",
    render: (i) => (
      <AdminRowActions
        onEdit={() => crud.openEdit(i)}
        onDelete={() => handleDelete(i)}
      />
    ),
  };

  const generalColumns: AdminTableColumn<Product>[] = [
    imageColumn,
    nameColumn,
    categoryColumn,
    { key: "price", header: "價格", render: (i) => `NT$ ${i.price}` },
    {
      key: "stock",
      header: "庫存",
      className: "text-muted-foreground",
      render: (i) => i.stock,
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
    actionsColumn,
  ];

  const auctionColumns: AdminTableColumn<Product>[] = [
    imageColumn,
    nameColumn,
    categoryColumn,
    {
      key: "auctionTime",
      header: "競標起迄",
      render: (i) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatProductDateTime(i.auctionStartTime)} ~{" "}
          {formatProductDateTime(i.auctionEndTime)}
        </span>
      ),
    },
    {
      key: "bid",
      header: "喊價狀況",
      render: (i) => {
        const prices = getAuctionPrices(i);
        return (
          <div className="text-sm">
            <div>目前 NT$ {prices.currentBid.toLocaleString()}</div>
            <div className="text-muted-foreground">
              每次 +NT$ {prices.minBidIncrement.toLocaleString()}
            </div>
          </div>
        );
      },
    },
    {
      key: "auctionStatus",
      header: "狀態",
      render: (i) => {
        const status = getAuctionStatus(i.auctionStartTime, i.auctionEndTime);
        return (
          <Badge className={AUCTION_BADGE_CLASS[status]}>
            {AUCTION_STATUS_LABEL[status]}
          </Badge>
        );
      },
    },
    actionsColumn,
  ];

  const presaleColumns: AdminTableColumn<Product>[] = [
    imageColumn,
    nameColumn,
    categoryColumn,
    {
      key: "backers",
      header: "預購人數",
      render: (i) => (
        <span className="text-sm">
          {(i.currentBackers ?? 0).toLocaleString()} /{" "}
          {(i.targetBackers ?? 0).toLocaleString()} 人
        </span>
      ),
    },
    {
      key: "progress",
      header: "達標百分比",
      render: (i) => (
        <span className="text-sm font-medium">
          {getPresaleProgress(i.currentBackers, i.targetBackers)}%
        </span>
      ),
    },
    {
      key: "presaleStatus",
      header: "狀態",
      render: (i) => {
        const status = getPresaleStatus(
          i.presaleStartTime,
          i.presaleEndTime,
          i.currentBackers,
          i.targetBackers,
        );
        return (
          <Badge className={PRESALE_BADGE_CLASS[status]}>
            {PRESALE_STATUS_LABEL[status]}
          </Badge>
        );
      },
    },
    actionsColumn,
  ];

  const columns =
    productTab === "auction"
      ? auctionColumns
      : productTab === "presale"
        ? presaleColumns
        : generalColumns;

  const tabItems = useMemo(() => {
    const items = crud.items.filter((item) => item.productType === productTab);
    if (productTab !== "presale") return items;
    return [...items].sort((a, b) => {
      const aStatus = getPresaleStatus(
        a.presaleStartTime,
        a.presaleEndTime,
        a.currentBackers,
        a.targetBackers,
      );
      const bStatus = getPresaleStatus(
        b.presaleStartTime,
        b.presaleEndTime,
        b.currentBackers,
        b.targetBackers,
      );
      return PRESALE_PIN_ORDER[aStatus] - PRESALE_PIN_ORDER[bStatus];
    });
  }, [crud.items, productTab]);

  return (
    <div>
      <AdminPageHeader
        title="商品管理"
        description="管理平台上架商品。"
        action={
          <Button onClick={crud.openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            新增商品
          </Button>
        }
      />

      <div className="mb-4 flex gap-5 border-b border-border">
        {PRODUCT_TABS.map((tab) => {
          const active = productTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setProductTab(tab.id)}
              className={`-mb-px border-b-2 pb-2 text-sm font-medium transition-colors ${
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <AdminTable
        columns={columns}
        items={tabItems}
        loading={crud.loading}
        error={crud.error}
        emptyText="目前沒有此類型商品"
      />

      <AdminModal
        open={crud.isModalOpen}
        title={crud.editingItem ? "編輯商品" : "新增商品"}
        onClose={crud.closeModal}
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <span className="text-sm font-medium">是否啟用</span>
          <Switch
            checked={form.isActive}
            onCheckedChange={(v) => setForm({ ...form, isActive: v })}
          />
        </div>
        <AdminField
          label="商品名稱"
          htmlFor="name"
          required
          error={errors.name}
        >
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

        <AdminField label="商品圖片" required error={errors.image}>
          <ImageUpload
            value={form.image}
            file={form.imageFile}
            onChange={(file) => setForm({ ...form, imageFile: file, image: "" })}
            onClear={() => setForm({ ...form, imageFile: null, image: "" })}
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

        <AdminField
          label="商品描述"
          htmlFor="description"
          error={errors.description}
        >
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="請輸入商品描述"
            className="h-24 w-full rounded-md border border-border p-2"
          />
        </AdminField>
      </AdminModal>
    </div>
  );
}

function ImageUpload({
  value,
  file,
  onChange,
  onClear,
}: {
  value: string;
  file: File | null;
  onChange: (file: File) => void;
  onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const preview = file ? URL.createObjectURL(file) : value || null;

  return (
    <div className="flex items-center gap-3">
      {preview ? (
        <div className="relative h-16 w-16 shrink-0">
          <img
            src={preview}
            alt="預覽"
            className="h-16 w-16 rounded-md object-cover border border-border"
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-destructive-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-dashed border-border bg-muted/40">
          <ImagePlus className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 space-y-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => ref.current?.click()}
        >
          <Upload className="h-3.5 w-3.5" />
          {preview ? "更換圖片" : "上傳圖片"}
        </Button>
        {file && (
          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
            {file.name}
          </p>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
