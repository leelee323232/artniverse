import axios from "axios";
import { api } from "@/lib/api";
import { normalizeCatalog, type CatalogProduct } from "./catalog-api";

export type ProductFavorite = { productId: string; isFavorited: boolean; canFavorite: boolean };
export type FavoriteProducts = { data: CatalogProduct[]; meta: { current_page: number; last_page: number; total: number; totalFavorites: number } };
export const FAVORITES_CHANGED = "artniverse:product-favorites-changed";

export async function fetchFavoriteProducts(search: string, page: number, signal: AbortSignal): Promise<FavoriteProducts> {
  const response = await api.get<{ data: Record<string, unknown>[]; meta: FavoriteProducts["meta"] }>("/api/v1/me/favorite-products", {
    params: { search, page, per_page: 20 }, signal, timeout: 15000,
  });
  return { ...response.data, data: response.data.data.map(normalizeCatalog) };
}

// Batch hearts mounted together, including shop and creator product grids. No persistent member cache.
type Pending = { id: string; resolve: (state: ProductFavorite) => void; reject: (error: unknown) => void };
const queues = new Map<string, Pending[]>();
export function fetchFavoriteState(userId: string, id: string): Promise<ProductFavorite> {
  return new Promise((resolve, reject) => {
    const existing = queues.get(userId);
    if (existing) { existing.push({ id, resolve, reject }); return; }
    const queue: Pending[] = [{ id, resolve, reject }]; queues.set(userId, queue);
    setTimeout(() => {
      queues.delete(userId);
      const ids = [...new Set(queue.map(item => item.id))];
      for (let start = 0; start < ids.length; start += 100) {
        const chunk = ids.slice(start, start + 100);
        const requests = queue.filter(item => chunk.includes(item.id));
        const params = new URLSearchParams(); chunk.forEach(id => params.append("product_ids[]", id));
        void api.get<{ data: ProductFavorite[] }>("/api/v1/product/favorite-statuses", { params, timeout: 15000 })
          .then(response => requests.forEach(item => {
            const state = response.data.data.find(row => row.productId === item.id);
            if (state) item.resolve(state); else item.reject(new Error("Missing favorite state"));
          })).catch(error => requests.forEach(item => item.reject(error)));
      }
    }, 20);
  });
}

export async function setProductFavorite(id: string, favorite: boolean, signal: AbortSignal) {
  await api.get("/sanctum/csrf-cookie", { signal, timeout: 15000 });
  const url = `/api/v1/product/${encodeURIComponent(id)}/favorite`;
  return (favorite
    ? await api.put<{ data: ProductFavorite }>(url, {}, { signal, timeout: 15000 })
    : await api.delete<{ data: ProductFavorite }>(url, { signal, timeout: 15000 })).data.data;
}

export function favoriteError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if ([401, 419].includes(error.response?.status ?? 0)) return "請重新登入後再操作收藏。";
    if (error.response?.status === 404) return "商品已下架或收藏服務尚未部署。";
    if (error.response?.status === 429) return "操作太頻繁，請稍後再試。";
  }
  return "無法確認收藏狀態，請稍後重試。";
}
