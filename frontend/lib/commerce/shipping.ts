export const SHIPPING_STORAGE_KEY = "artniverse_shipping_rules_v1";
export const SHIPPING_ZONES = { mainland: "台灣本島", islands: "台灣離島" } as const;
export const SHIPPING_METHODS = { home: "宅配", seven: "7-11 店到店", family: "全家店到店" } as const;
export type ShippingZone = keyof typeof SHIPPING_ZONES;
export type ShippingMethod = keyof typeof SHIPPING_METHODS;
export type FreeShipping = "none" | "threshold" | "always";

// Country and currency remain explicit so additional markets can be added later.
export interface ShippingRule {
  id: string;
  name: string;
  country: "TW";
  currency: "TWD";
  zone: ShippingZone;
  method: ShippingMethod;
  fee: number;
  freeShipping: FreeShipping;
  threshold: number | null;
  enabled: boolean;
  version: number;
}

export const DEFAULT_SHIPPING_RULES: ShippingRule[] = [
  { id: "tw-mainland-home", name: "本島宅配", country: "TW", currency: "TWD", zone: "mainland", method: "home", fee: 80, freeShipping: "threshold", threshold: 1000, enabled: true, version: 1 },
  { id: "tw-mainland-seven", name: "本島 7-11 店到店", country: "TW", currency: "TWD", zone: "mainland", method: "seven", fee: 60, freeShipping: "threshold", threshold: 1000, enabled: false, version: 1 },
  { id: "tw-mainland-family", name: "本島全家店到店", country: "TW", currency: "TWD", zone: "mainland", method: "family", fee: 60, freeShipping: "threshold", threshold: 1000, enabled: false, version: 1 },
  { id: "tw-islands-home", name: "離島宅配", country: "TW", currency: "TWD", zone: "islands", method: "home", fee: 200, freeShipping: "none", threshold: null, enabled: false, version: 1 },
];

export function validateShippingRule(rule: ShippingRule, rules: ShippingRule[]): string | null {
  if (!rule.id || !rule.name.trim() || rule.name.length > 60) return "請輸入 1 至 60 字的規則名稱。";
  if (rule.country !== "TW" || rule.currency !== "TWD" || !Object.hasOwn(SHIPPING_ZONES, rule.zone) || !Object.hasOwn(SHIPPING_METHODS, rule.method)) return "請選擇有效的台灣配送區域與方式。";
  if (!Number.isSafeInteger(rule.fee) || rule.fee < 0) return "運費須為零或正整數。";
  if (!["none", "threshold", "always"].includes(rule.freeShipping)) return "請選擇免運條件。";
  if (rule.freeShipping === "threshold" && (rule.threshold === null || !Number.isSafeInteger(rule.threshold) || rule.threshold <= 0)) return "滿額免運門檻須為正整數。";
  if (rule.freeShipping !== "threshold" && rule.threshold !== null) return "此免運方式不需要金額門檻。";
  if (typeof rule.enabled !== "boolean" || !Number.isSafeInteger(rule.version) || rule.version < 1) return "規則狀態或版本不正確。";
  if (rule.enabled && rules.some(item => item.id !== rule.id && item.enabled && item.country === rule.country && item.zone === rule.zone && item.method === rule.method)) return "此區域與配送方式已有啟用規則，請先停用原規則。";
  return null;
}

export function parseShippingRules(raw: string): ShippingRule[] {
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data) || data.some(item => !item || typeof item !== "object" || typeof item.id !== "string" || typeof item.name !== "string")) throw new Error("運費設定資料格式不正確，請保留資料並聯絡管理員。");
  const rules = data as ShippingRule[];
  if (new Set(rules.map(rule => rule.id)).size !== rules.length || rules.some(rule => validateShippingRule(rule, rules))) throw new Error("運費設定資料有衝突或無效欄位，請保留資料並聯絡管理員。");
  return rules;
}

export function quoteShipping(rules: ShippingRule[], zone: ShippingZone, method: ShippingMethod, subtotal: number) {
  if (!Number.isSafeInteger(subtotal) || subtotal < 0) return { available: false as const, reason: "請輸入零或正整數的商品小計。" };
  const matches = rules.filter(rule => rule.enabled && rule.country === "TW" && rule.zone === zone && rule.method === method);
  if (!matches.length) return { available: false as const, reason: "此區域暫未提供此配送方式。" };
  if (matches.length > 1 || validateShippingRule(matches[0], rules)) return { available: false as const, reason: "配送規則有衝突或無效設定，無法試算。" };
  const rule = matches[0];
  const free = rule.freeShipping === "always" || (rule.freeShipping === "threshold" && subtotal >= rule.threshold!);
  return { available: true as const, rule, fee: free ? 0 : rule.fee, total: subtotal + (free ? 0 : rule.fee), reason: rule.freeShipping === "always" ? "無條件免運" : free ? "已達滿額免運門檻" : "套用固定運費", remaining: rule.freeShipping === "threshold" ? Math.max(0, rule.threshold! - subtotal) : null };
}
