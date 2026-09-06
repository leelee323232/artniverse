"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { StatusToggle } from "@/components/admin/StatusToggle";
import { useAdminCrud } from "@/lib/admin/useAdminCrud";
import { mockProductTemplates } from "@/mocks/admin/productTemplates";
import type {
  ProductTemplate,
  PrintZone,
} from "@/app/creator-portal/products/new/_components/data/platform-products";

interface FormState {
  name: string;
  nameZh: string;
  category: string;
  baseCost: string;
  minOrder: string;
  hasMinQuantity: boolean;
  designSource: "image" | "templateFile";
  specs: string;
  // 僅供 textarea 編輯使用；送出後會解析成與創作者端相同的 PrintZone[]。
  printZonesInput: string;
  templateFileName: string;
  templateFileUrl: string;
  sortOrder: string;
  isActive: boolean;
}

const emptyForm: FormState = {
  name: "",
  nameZh: "",
  category: "",
  baseCost: "0",
  minOrder: "1",
  hasMinQuantity: false,
  designSource: "image",
  specs: "",
  printZonesInput: "",
  templateFileName: "",
  templateFileUrl: "",
  sortOrder: "1",
  isActive: true,
};

const printZonesToText = (zones: PrintZone[]) =>
  zones
    .map(
      (zone) =>
        `${zone.name}|${zone.width}|${zone.height}|${zone.position.x}|${zone.position.y}|${zone.position.w}|${zone.position.h}`,
    )
    .join("\n");

const parsePrintZones = (value: string): PrintZone[] =>
  value
    .split("\n")
    .map((line, index) => {
      const [name, width, height, x, y, w, h] = line
        .split("|")
        .map((item) => item.trim());
      const numericWidth = Number(width);
      const numericHeight = Number(height);
      const position = [x, y, w, h].map(Number);
      if (
        !name ||
        !Number.isFinite(numericWidth) ||
        !Number.isFinite(numericHeight) ||
        position.some((value) => !Number.isFinite(value))
      ) {
        return null;
      }
      return {
        id: `zone-${index + 1}`,
        name,
        width: numericWidth,
        height: numericHeight,
        position: {
          x: position[0],
          y: position[1],
          w: position[2],
          h: position[3],
        },
      };
    })
    .filter((zone): zone is PrintZone => zone !== null);

export default function ProductTemplatesPage() {
  const crud = useAdminCrud<ProductTemplate>("pt", mockProductTemplates);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const template = crud.editingItem;
    if (!crud.isModalOpen) return;
    if (!template) {
      setForm({ ...emptyForm, sortOrder: String(crud.items.length + 1) });
    } else {
      setForm({
        name: template.name,
        nameZh: template.nameZh,
        category: template.category,
        baseCost: String(template.baseCost),
        minOrder: String(template.minOrder),
        hasMinQuantity: template.hasMinQuantity,
        designSource: template.designSource,
        specs: template.specs.join("\n"),
        printZonesInput: printZonesToText(template.printZones),
        templateFileName: template.templateFile?.name ?? "",
        templateFileUrl: template.templateFile?.url ?? "",
        sortOrder: String(template.sortOrder),
        isActive: template.isActive,
      });
    }
    setErrors({});
  }, [crud.editingItem, crud.isModalOpen, crud.items.length]);

  const handleSubmit = () => {
    const printZones = parsePrintZones(form.printZonesInput);
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "請輸入英文名稱";
    if (!form.nameZh.trim()) errors.nameZh = "請輸入中文名稱";
    if (!form.category.trim()) errors.category = "請輸入商品類別";
    if (Number.isNaN(Number(form.baseCost))) errors.baseCost = "請輸入有效成本";
    if (!printZones.length)
      errors.printZones = "至少新增一個印刷區域（名稱|寬|高|x|y|w|h）";
    if (form.designSource === "templateFile" && !form.templateFileUrl.trim()) {
      errors.templateFileUrl = "模板檔案模式需提供模板檔案網址";
    }
    setErrors(errors);
    if (Object.keys(errors).length) return;

    crud.submit({
      name: form.name.trim(),
      nameZh: form.nameZh.trim(),
      category: form.category.trim(),
      baseCost: Number(form.baseCost),
      minOrder: Number(form.minOrder) || 1,
      hasMinQuantity: form.hasMinQuantity,
      designSource: form.designSource,
      specs: form.specs
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      printZones,
      templateFile:
        form.designSource === "templateFile"
          ? {
              name: form.templateFileName.trim() || "商品模板檔案",
              url: form.templateFileUrl.trim(),
            }
          : undefined,
      sortOrder: Number(form.sortOrder) || 1,
      isActive: form.isActive,
    });
  };

  const columns: AdminTableColumn<ProductTemplate>[] = [
    {
      key: "nameZh",
      header: "模板名稱",
      render: (item) => <span className="font-medium">{item.nameZh}</span>,
    },
    { key: "category", header: "類別", render: (item) => item.category },
    {
      key: "designSource",
      header: "設計圖來源",
      render: (item) =>
        item.designSource === "templateFile" ? "模板檔案" : "設計圖片",
    },
    {
      key: "printZones",
      header: "印刷區域",
      render: (item) => item.printZones.map((zone) => zone.name).join("、"),
    },
    {
      key: "specs",
      header: "規格",
      render: (item) => (item.specs.length ? `${item.specs.length} 項` : "—"),
    },
    {
      key: "status",
      header: "狀態",
      render: (item) => (
        <StatusToggle
          active={item.isActive}
          onToggle={() => crud.toggleActive(item)}
        />
      ),
    },
    {
      key: "actions",
      header: "操作",
      render: (item) => (
        <Button variant="ghost" size="sm" onClick={() => crud.openEdit(item)}>
          <Pencil className="mr-1 h-4 w-4" />
          編輯
        </Button>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="商品模板管理"
        description="維護創作者新增商品第一步會讀取的商品模板、印刷區域與規格。"
        action={
          <Button onClick={crud.openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            新增模板
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
        title={crud.editingItem ? "編輯商品模板" : "新增商品模板"}
        onClose={crud.closeModal}
        onSubmit={handleSubmit}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField
            label="中文名稱"
            htmlFor="nameZh"
            required
            error={errors.nameZh}
          >
            <Input
              id="nameZh"
              value={form.nameZh}
              onChange={(event) =>
                setForm({ ...form, nameZh: event.target.value })
              }
            />
          </AdminField>
          <AdminField
            label="英文名稱"
            htmlFor="name"
            required
            error={errors.name}
          >
            <Input
              id="name"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
            />
          </AdminField>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField
            label="商品類別"
            htmlFor="category"
            required
            error={errors.category}
          >
            <Input
              id="category"
              value={form.category}
              onChange={(event) =>
                setForm({ ...form, category: event.target.value })
              }
            />
          </AdminField>
          <AdminField
            label="基本成本"
            htmlFor="baseCost"
            error={errors.baseCost}
          >
            <Input
              id="baseCost"
              type="number"
              min="0"
              value={form.baseCost}
              onChange={(event) =>
                setForm({ ...form, baseCost: event.target.value })
              }
            />
          </AdminField>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField label="最小訂購量" htmlFor="minOrder">
            <Input
              id="minOrder"
              type="number"
              min="1"
              value={form.minOrder}
              onChange={(event) =>
                setForm({ ...form, minOrder: event.target.value })
              }
            />
          </AdminField>
          <AdminField label="設計圖來源">
            <Select
              value={form.designSource}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  designSource: value as FormState["designSource"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">設計圖片</SelectItem>
                <SelectItem value="templateFile">模板檔案</SelectItem>
              </SelectContent>
            </Select>
          </AdminField>
        </div>
        <AdminField label="商品規格" htmlFor="specs">
          <Textarea
            id="specs"
            value={form.specs}
            onChange={(event) =>
              setForm({ ...form, specs: event.target.value })
            }
            placeholder="一行一項，例如：尺寸: XS-3XL"
          />
        </AdminField>
        <AdminField
          label="印刷區域"
          htmlFor="printZones"
          required
          error={errors.printZones}
        >
          <Textarea
            id="printZones"
            value={form.printZonesInput}
            onChange={(event) =>
              setForm({ ...form, printZonesInput: event.target.value })
            }
            placeholder={"正面|30|40|25|20|50|50\n背面|30|40|25|20|50|50"}
          />
          <p className="text-xs leading-5 text-muted-foreground">
            每行一個印刷區域，格式為「名稱｜寬(cm)｜高(cm)｜x(%)｜y(%)｜w(%)｜h(%)」。x、y
            為效果圖中印刷區域左上角的位置；w、h
            為印刷區域在效果圖中的寬高比例，皆使用 0–100 的百分比。
          </p>
        </AdminField>
        {/* {form.designSource === "templateFile" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminField label="模板檔案名稱" htmlFor="templateFileName">
              <Input
                id="templateFileName"
                value={form.templateFileName}
                onChange={(event) =>
                  setForm({ ...form, templateFileName: event.target.value })
                }
                placeholder="例如：貼紙組刀模.ai"
              />
            </AdminField>
            <AdminField
              label="模板檔案網址"
              htmlFor="templateFileUrl"
              required
              error={errors.templateFileUrl}
            >
              <Input
                id="templateFileUrl"
                value={form.templateFileUrl}
                onChange={(event) =>
                  setForm({ ...form, templateFileUrl: event.target.value })
                }
                placeholder="https://..."
              />
            </AdminField>
          </div>
        )} */}
      </AdminModal>
    </div>
  );
}
