"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductOptions } from "@/types/admin";
import { COMMON_SIZES, optionLabelKey, validHex } from "@/lib/products/options";

export function ProductOptionsEditor({ value, onChange, errors }: {
  value: ProductOptions;
  onChange: (value: ProductOptions) => void;
  errors: Record<string, string>;
}) {
  return <section className="space-y-5" aria-label="商品規格">
    {(["styles", "sizes"] as const).map(key => {
      const title = key === "styles" ? "款式" : "尺寸";
      function add(label = "") {
        onChange({ ...value, [key]: [...value[key], { id: crypto.randomUUID(), label }] });
      }
      return <fieldset key={key} className="min-w-0 space-y-3">
        <legend className="mb-2 text-sm font-medium">{title}</legend>
        {key === "sizes" && <div className="flex flex-wrap gap-2" aria-label="常用尺寸">
          {COMMON_SIZES.map(size => <Button key={size} type="button" variant="outline" size="sm" disabled={value.sizes.some(option => optionLabelKey(option.label) === optionLabelKey(size))} onClick={() => add(size)} aria-label={`新增常用尺寸 ${size}`}>{size}</Button>)}
        </div>}
        {value[key].length === 0 && <p className="text-xs text-muted-foreground">尚未設定{title}</p>}
        {value[key].map((option, index) => <div key={option.id} className="space-y-1">
          <div className="flex gap-2">
            <Input aria-label={`${title}名稱 ${index + 1}`} aria-invalid={!!errors[option.id]} aria-describedby={errors[option.id] ? `${option.id}-error` : undefined} value={option.label} placeholder={key === "styles" ? "例如：黑白款、繽紛色彩" : "例如：M、A4、30 × 40 cm"} onChange={event => onChange({ ...value, [key]: value[key].map(item => item.id === option.id ? { ...item, label: event.target.value } : item) })} />
            <Button type="button" variant="ghost" size="icon" aria-label={`刪除${title} ${option.label || index + 1}`} onClick={() => onChange({ ...value, [key]: value[key].filter(item => item.id !== option.id) })}><X className="h-4 w-4" /></Button>
          </div>
          {errors[option.id] && <p id={`${option.id}-error`} role="alert" className="text-xs text-destructive">{errors[option.id]}</p>}
        </div>)}
        <Button type="button" variant="outline" size="sm" onClick={() => add()}><Plus className="h-4 w-4" />新增{title}</Button>
      </fieldset>;
    })}
    <fieldset className="min-w-0 space-y-3">
      <legend className="mb-2 text-sm font-medium">顏色</legend>
      {value.colors.length === 0 && <p className="text-xs text-muted-foreground">尚未設定顏色</p>}
      {value.colors.map((color, index) => <div key={color.id} className="space-y-2 rounded-md border border-border p-3">
        <div className="flex gap-2">
          <Input aria-label={`顏色名稱 ${index + 1}`} aria-invalid={!!errors[color.id]} value={color.label} placeholder="例如：奶油白、森林綠" onChange={event => onChange({ ...value, colors: value.colors.map(item => item.id === color.id ? { ...item, label: event.target.value } : item) })} />
          <Button type="button" variant="ghost" size="icon" aria-label={`刪除顏色 ${color.label || index + 1}`} onClick={() => onChange({ ...value, colors: value.colors.filter(item => item.id !== color.id) })}><X className="h-4 w-4" /></Button>
        </div>
        <div className="flex items-center gap-3">
          <input type="color" aria-label={`選擇顏色 ${index + 1}`} className="h-9 w-12 shrink-0 cursor-pointer rounded border border-border bg-transparent p-1" value={validHex(color.hex) ? color.hex : "#FFFFFF"} onChange={event => onChange({ ...value, colors: value.colors.map(item => item.id === color.id ? { ...item, hex: event.target.value.toUpperCase() } : item) })} />
          <Input aria-label={`HEX 色碼 ${index + 1}`} aria-invalid={!!errors[`${color.id}-hex`]} value={color.hex} placeholder="#FFFFFF" maxLength={7} className="min-w-0 font-mono" onChange={event => onChange({ ...value, colors: value.colors.map(item => item.id === color.id ? { ...item, hex: event.target.value } : item) })} />
        </div>
        {errors[color.id] && <p role="alert" className="text-xs text-destructive">{errors[color.id]}</p>}
        {errors[`${color.id}-hex`] && <p role="alert" className="text-xs text-destructive">{errors[`${color.id}-hex`]}</p>}
      </div>)}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...value, colors: [...value.colors, { id: crypto.randomUUID(), label: "", hex: "#FFFFFF" }] })}><Plus className="h-4 w-4" />新增顏色</Button>
    </fieldset>
  </section>;
}
