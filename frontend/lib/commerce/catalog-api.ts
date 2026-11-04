import axios from "axios";
import { api } from "@/lib/api";
import type { Product, ProductOption } from "@/types/admin";

export type CatalogReview = { id: number; userName: string; avatar: string; rating: number; date: string; content: string; images: string[]; helpful: number; verified: boolean; isDemo?: boolean };
export type CatalogProduct = Product & { images: string[]; category: string; originalPrice: number; features: string[]; specifications: Record<string, string>; creatorName: string; reviews: CatalogReview[]; rating: number | null; reviewCount: number; sold: number | null; isDemo: boolean };
type Row = Record<string, unknown>;
function decoded(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try { return JSON.parse(value); } catch { return value; }
}
const object = (value: unknown): Row => { const data = decoded(value); return data && typeof data === "object" && !Array.isArray(data) ? data as Row : {}; };
const number = (value: unknown, fallback = 0) => Number.isFinite(Number(value)) && value != null ? Number(value) : fallback;
const strings = (value: unknown): string[] => { const data = decoded(value); return Array.isArray(data) ? data.filter((v): v is string => typeof v === "string") : typeof data === "string" && data ? [data] : []; };

function specificationText(value: unknown, depth = 0): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "是" : "否";
  if (!value || typeof value !== "object" || depth > 10) return "";
  return Object.entries(value).map(([key, item]) => {
    const text = specificationText(item, depth + 1);
    return text ? (Array.isArray(value) ? text : `${key}：${text}`) : "";
  }).filter(Boolean).join("、");
}

function productOptions(value: unknown): (ProductOption & { hex: string })[] {
  const options = decoded(value);
  if (!Array.isArray(options)) return [];
  return options.flatMap(value => {
    const option = object(value);
    const label = typeof option.label === "string" ? option.label.trim() : "";
    if (!label) return [];
    // Missing legacy IDs use a display-only key; these options are not sent to the cart.
    const id = typeof option.id === "string" || typeof option.id === "number" ? String(option.id) : label;
    const hex = typeof option.hex === "string" && /^#[0-9a-f]{6}$/i.test(option.hex) ? option.hex.toUpperCase() : "";
    return [{ id, label, hex }];
  });
}

export function normalizeCatalog(row: Row): CatalogProduct {
  const meta = object(row.catalog_meta);
  const pick = (camel: string, snake: string) => row[camel] ?? row[snake] ?? meta[camel];
  const kind = pick("productType", "product_type");
  const images = strings(row.images ?? row.image);
  const styles = productOptions(row.styles).map(({ id, label }) => ({ id, label }));
  const sizes = productOptions(row.sizes).map(({ id, label }) => ({ id, label }));
  const colors = productOptions(row.colors);
  const specifications = Object.fromEntries(Object.entries(object(row.specifications))
    .map(([key, value]) => [key, specificationText(value)] as const).filter(([, value]) => value !== ""));
  // Match the public API summary, including older deployments returning JSON strings.
  // Replace same-name summaries, rather than showing the options twice.
  for (const [title, options] of [["款式", styles], ["尺寸", sizes], ["顏色", colors]] as const) {
    if (options.length) specifications[title] = [...new Set(options.map(option => option.label))].join("、");
  }
  const reviews = Array.isArray(row.reviews) ? (row.reviews as CatalogReview[]).filter(review => !review.isDemo) : [];
  const date = (camel: string, snake: string) => { const v = pick(camel, snake); return typeof v === "string" ? v : null; };
  return {
    id: String(row.id), name: String(row.name ?? ""), price: number(row.price), image: images[0] ?? "", images,
    category: String(row.category ?? ""), categoryId: String(pick("categoryId", "category_id") ?? ""),
    stock: number(row.stock), isActive: ![false, 0, "0"].includes(pick("isActive", "is_active") as boolean | number | string),
    sortOrder: number(pick("sortOrder", "sort_order")), createdAt: String(row.createdAt ?? row.created_at ?? ""),
    productType: kind === "auction" || kind === "presale" ? kind : "general",
    creatorId: String(row.creatorId ?? row.creator_id ?? ""), creatorName: String(row.creatorName ?? row.creator_name ?? "創作者"),
    description: String(row.description ?? ""), originalPrice: number(row.originalPrice ?? row.original_price, number(row.price)),
    features: strings(row.features), specifications, styles, sizes, colors,
    reviews, rating: reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null, reviewCount: reviews.length,
    sold: number(row.sold), isDemo: meta.isDemo === true,
    auctionStartPrice: number(pick("auctionStartPrice", "auction_start_price"), number(row.price)), currentBid: number(pick("currentBid", "current_bid"), number(row.price)), auctionMinIncrement: number(pick("auctionMinIncrement", "auction_min_increment"), 100),
    auctionStartTime: date("auctionStartTime", "auction_start_time"), auctionEndTime: date("auctionEndTime", "auction_end_time"),
    currentBackers: number(pick("currentBackers", "current_backers")), targetBackers: number(pick("targetBackers", "target_backers")),
    presaleStartTime: date("presaleStartTime", "presale_start_time"), presaleEndTime: date("presaleEndTime", "presale_end_time"),
  };
}
export async function catalog(signal?: AbortSignal) {
  const { data } = await api.get<{ data: Row[] }>("/api/v1/product", { signal, timeout: 15000 });
  return data.data.map(normalizeCatalog).filter(p => p.isActive);
}
export async function catalogProduct(id: string, signal?: AbortSignal) {
  const { data } = await api.get<{ data: Row }>(`/api/v1/product/${encodeURIComponent(id)}`, { signal, timeout: 15000 });
  const product = normalizeCatalog(data.data);
  if (!product.isActive) throw new Error("商品已下架。");
  return product;
}
export type CartOptionIds = { style_id?: string; color_id?: string; size_id?: string };
export async function addCatalogItem(id: string, quantity = 1, options: CartOptionIds = {}) {
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) throw new Error("商品或數量不正確。");
  await api.get("/sanctum/csrf-cookie", { timeout: 15000 });
  await api.post("/api/v1/cart", {
    product_id: Number(id), quantity,
    ...(options.style_id ? { style_id: options.style_id } : {}),
    ...(options.color_id ? { color_id: options.color_id } : {}),
    ...(options.size_id ? { size_id: options.size_id } : {}),
  }, { timeout: 15000 });
  window.dispatchEvent(new Event("artniverse-cart-updated"));
}
export function catalogError(error: unknown) {
  if (axios.isAxiosError(error)) {
    if ([401, 419].includes(error.response?.status ?? 0)) return "請先登入，再加入購物車。";
    if (error.response?.status === 404) return "找不到商品或服務尚未部署，請重新載入。";
    if (error.response?.status === 422 && typeof error.response.data?.message === "string") return error.response.data.message;
    return "服務暫時無法回應，請重新載入購物車確認是否已加入，勿連續重送。";
  }
  return error instanceof Error ? error.message : "操作失敗。";
}
