"use client";

import { useId } from "react";
import type { Product, ProductOption } from "@/types/admin";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const OPTION_FIELDS = [
  { key: "styles", name: "款式" },
  { key: "colors", name: "顏色" },
  { key: "sizes", name: "尺寸" },
] as const;

export type ProductOptionSelection = Partial<Record<typeof OPTION_FIELDS[number]["key"], ProductOption>>;

export function ProductOptionsSelector({ product, selection, onChange, disabled = false }: {
  product: Pick<Product, "styles" | "colors" | "sizes">;
  selection: ProductOptionSelection;
  onChange: (selection: ProductOptionSelection) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const fields = OPTION_FIELDS.filter(({ key }) => Array.isArray(product[key]) && product[key]!.length > 0);
  if (!fields.length) return null;

  return (
    <div className="grid grid-cols-1 gap-4">
      {fields.map(({ key, name }) => (
        <div key={key} className="space-y-2">
          <label htmlFor={`${id}-${key}`} className="text-sm font-medium">{name}</label>
          <Select value={selection[key]?.id ?? ""} disabled={disabled} onValueChange={(optionId) => {
            const option = product[key]!.find(item => item.id === optionId);
            if (option) onChange({ ...selection, [key]: { id: option.id, label: option.label } });
          }}>
            <SelectTrigger id={`${id}-${key}`}>
              <SelectValue placeholder={`請選擇${name}`}>{selection[key]?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {product[key]!.map(option => <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      ))}
      <p className="text-xs text-muted-foreground">所選規格會隨請求送出，目前仍待後端支援儲存。</p>
    </div>
  );
}
