import axios from "axios";
import { api } from "@/lib/api";

export type CreatorFollow = {
  creatorId: string;
  isFollowing: boolean;
  canFollow: boolean;
  followers: number | null;
};

export async function fetchCreatorFollow(id: string, signal: AbortSignal) {
  return (await api.get<{ data: CreatorFollow }>(`/api/v1/creators/${encodeURIComponent(id)}/follow`, { signal, timeout: 15000 })).data.data;
}

export async function setCreatorFollow(id: string, following: boolean, signal: AbortSignal) {
  await api.get("/sanctum/csrf-cookie", { signal, timeout: 15000 });
  const url = `/api/v1/creators/${encodeURIComponent(id)}/follow`;
  const response = following
    ? await api.put<{ data: CreatorFollow }>(url, {}, { signal, timeout: 15000 })
    : await api.delete<{ data: CreatorFollow }>(url, { signal, timeout: 15000 });
  return response.data.data;
}

export function creatorFollowError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401 || status === 419) return "登入已失效，請重新登入後確認追蹤狀態。";
    if (status === 404) return "創作者目前未公開，或追蹤服務尚未部署。";
    if (status === 429) return "操作太頻繁，請稍後再試。";
    if (status === 422 && typeof error.response?.data?.message === "string") return error.response.data.message;
  }
  return "無法確認追蹤狀態，請重新查詢後再操作。";
}
