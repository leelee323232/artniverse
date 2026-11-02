import axios from "axios";
import { api } from "@/lib/api";
import type { ExploreCreator } from "@/lib/explore-api";
import { normalizeCatalog, type CatalogProduct } from "@/lib/commerce/catalog-api";

export type CreatorProfile = ExploreCreator & {
  totalReviews: number;
  joinedDate: string | null;
  productCount: number;
  capabilities: { posts: boolean; superSubscription: boolean; tips: boolean; commissions: boolean; follow: boolean };
};
export type CreatorProductSort = "default" | "newest" | "price_asc" | "price_desc";
export type CreatorProducts = {
  data: CatalogProduct[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
};

export async function fetchCreatorProfile(id: string, signal: AbortSignal) {
  return (await api.get<{ data: CreatorProfile }>(`/api/v1/creators/${encodeURIComponent(id)}`, { signal, timeout: 15000 })).data.data;
}

export async function fetchCreatorProducts(id: string, page: number, sort: CreatorProductSort, signal: AbortSignal): Promise<CreatorProducts> {
  const { data } = await api.get<{ data: Record<string, unknown>[]; meta: CreatorProducts["meta"] }>(
    `/api/v1/creators/${encodeURIComponent(id)}/products`,
    { params: { page, per_page: 20, sort }, signal, timeout: 15000 },
  );
  return { data: data.data.map(normalizeCatalog), meta: data.meta };
}

export function creatorNotFound(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

export function creatorProfileError(error: unknown) {
  if (creatorNotFound(error)) return "找不到此創作者，或創作者目前未公開。";
  if (axios.isAxiosError(error) && error.response?.status === 429) return "查詢次數較多，請稍後再試。";
  return "暫時無法載入資料，請稍後重試。";
}
