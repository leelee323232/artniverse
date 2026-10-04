import type { Product, ProductType } from "../../types/admin";

export const CART_STORAGE_KEY = "artniverse_cart_v1";
export const TYPE_LABEL: Record<ProductType, string> = { general: "一般商品", presale: "預售商品", auction: "競標得標" };
export type AuctionAward = { productId: string; amount: number; deadline: number; rank: number };
export type CartLine = { productId: string; quantity: number; award?: AuctionAward };
export type CartState = { items: CartLine[]; awards: AuctionAward[] };
export const emptyCart = (): CartState => ({ items: [], awards: [] });
export const normalizeProductId = (id: string) => id.trim().replace(/^p-(?=\d+$)/, "");

export function validAward(value: unknown): value is AuctionAward {
  if (!value || typeof value !== "object") return false;
  const a = value as AuctionAward;
  return typeof a.productId === "string" && Number.isFinite(a.amount) && a.amount > 0 &&
    Number.isFinite(a.deadline) && a.deadline > 0 && Number.isSafeInteger(a.rank) && a.rank > 0;
}

// Store only identities and quantities; current catalog data determines ordinary prices and availability.
export function readCart(raw: string | null): CartState {
  try {
    const value = JSON.parse(raw ?? "null");
    if (!value || !Array.isArray(value.items) || !Array.isArray(value.awards)) return emptyCart();
    const awards: AuctionAward[] = value.awards.filter(validAward).filter((a: AuctionAward, i: number, all: AuctionAward[]) => all.findIndex(b => b.productId === a.productId) === i);
    const items: CartLine[] = [];
    for (const line of value.items) {
      if (!line || typeof line.productId !== "string" || !Number.isSafeInteger(line.quantity) || line.quantity < 1 || items.some(i => i.productId === line.productId)) continue;
      const award = awards.find(a => a.productId === line.productId);
      items.push({ productId: line.productId, quantity: award ? 1 : line.quantity, ...(award ? { award } : {}) });
    }
    return { items, awards };
  } catch { return emptyCart(); }
}

export function purchaseIssue(product: Product | undefined, now: number, award?: AuctionAward): string | null {
  if (!product || !product.isActive) return "商品已下架或不存在";
  if (!product.creatorId) return "商品賣場資料尚未完整";
  if (product.productType === "auction") {
    if (!validAward(award) || award.productId !== product.id) return "請由得標商品頁加入購物車";
    return now >= award.deadline ? "得標付款期限已過" : null;
  }
  if (product.stock <= 0) return "商品已售完";
  if (product.productType === "presale") {
    const start = Date.parse(product.presaleStartTime ?? "");
    const end = Date.parse(product.presaleEndTime ?? "");
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || !(product.targetBackers && product.targetBackers > 0)) return "預售資料尚未完整";
    if (now < start) return "預售尚未開始";
    if (now >= end) return "預售已截止，停止購買";
    if ((product.currentBackers ?? 0) >= product.targetBackers) return "預售已達標，停止購買";
  }
  return null;
}

export function addCartItem(state: CartState, product: Product | undefined, quantity: number, now: number, newAward?: AuctionAward): { state: CartState; error?: string } {
  // Retain the first award even after removal, so a refreshed preview cannot extend payment time.
  const award = state.awards.find(a => a.productId === product?.id) ?? newAward;
  const error = purchaseIssue(product, now, award);
  if (error || !product) return { state, error: error ?? "找不到商品" };
  if (!Number.isSafeInteger(quantity) || quantity < 1) return { state, error: "請選擇有效數量" };
  const existing = state.items.find(i => i.productId === product.id);
  const nextQuantity = product.productType === "auction" ? 1 : (existing?.quantity ?? 0) + quantity;
  if (product.productType !== "auction" && nextQuantity > product.stock) return { state, error: `含購物車現有數量，最多可購買 ${product.stock} 件` };
  const line: CartLine = { productId: product.id, quantity: nextQuantity, ...(product.productType === "auction" ? { award } : {}) };
  return { state: {
    items: existing ? state.items.map(i => i.productId === product.id ? line : i) : [...state.items, line],
    awards: product.productType === "auction" && award && !state.awards.some(a => a.productId === product.id) ? [...state.awards, award] : state.awards,
  } };
}

export function cartGroupId(product: Product) {
  return `${product.creatorId}:${product.productType}${product.productType === "auction" ? `:${product.id}` : ""}`;
}
export function cartLineIssue(line: CartLine, product: Product | undefined, now: number) {
  return purchaseIssue(product, now, line.award) ?? (product && product.productType !== "auction" && line.quantity > product.stock ? `庫存僅剩 ${product.stock} 件，請調整數量` : null);
}
export function shippingFor(subtotal: number) { return subtotal === 0 || subtotal >= 1000 ? 0 : 80; }
