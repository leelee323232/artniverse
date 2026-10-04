import type { ProductOptions } from "../../types/admin";

export const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "均碼"];
export const emptyOptions = (): ProductOptions => ({ styles: [], sizes: [], colors: [] });
export const optionLabelKey = (label: string) => label.trim().normalize("NFKC").toLocaleLowerCase();
export const validHex = (hex: string) => /^#[0-9a-f]{6}$/i.test(hex);

export function validateOptions(options: ProductOptions): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const key of ["styles", "sizes", "colors"] as const) {
    const seen = new Set<string>();
    for (const option of options[key]) {
      const label = optionLabelKey(option.label);
      if (!label) errors[option.id] = "請輸入名稱，或刪除此選項";
      else if (seen.has(label)) errors[option.id] = "同一規格的名稱不能重複";
      seen.add(label);
    }
  }
  for (const color of options.colors) {
    if (!validHex(color.hex)) errors[`${color.id}-hex`] = "請輸入六位 HEX 色碼，例如 #FFFFFF";
  }
  return errors;
}

export function normalizeOptions(options: ProductOptions): ProductOptions {
  return {
    styles: options.styles.map(option => ({ ...option, label: option.label.trim() })),
    sizes: options.sizes.map(option => ({ ...option, label: option.label.trim() })),
    colors: options.colors.map(option => ({ ...option, label: option.label.trim(), hex: option.hex.toUpperCase() })),
  };
}
