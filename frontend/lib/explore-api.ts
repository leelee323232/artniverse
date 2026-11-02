import axios from "axios";
import { api } from "@/lib/api";

export type CreatorSort = "rating" | "followers" | "newest";
export type ExploreCreator = {
  id: string; name: string; creator: string; description: string;
  tags: string[]; followers: number; rating: number; reviewCount: number;
  image: string | null; color: string; createdAt: string | null;
};
export type ExploreResult = {
  data: ExploreCreator[];
  meta: { current_page: number; last_page: number; per_page: number; total: number; totalCreators: number };
};
export async function fetchExploreCreators(params: { search: string; tag?: string; sort: CreatorSort; page: number }, signal: AbortSignal) {
  return (await api.get<ExploreResult>("/api/v1/creators", { params: { ...params, per_page: 20 }, signal, timeout: 15000 })).data;
}
export async function fetchCreatorTags(signal: AbortSignal) {
  return (await api.get<{ data: string[] }>("/api/v1/creators/tags", { signal, timeout: 15000 })).data.data;
}
export function exploreError(error: unknown) {
  if (axios.isAxiosError(error) && error.response?.status === 429) return "查詢次數較多，請稍候再試。";
  return "暫時無法載入創作者，請稍後重試。";
}
