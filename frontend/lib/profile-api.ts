import axios from "axios";
import { api } from "@/lib/api";
import type { ApiUser } from "@/lib/auth-context";

export type ProfileInput = {
  name: string;
  phone: string | null;
  birthday: string | null;
  address: string | null;
  bio: string | null;
};

export async function saveProfile(input: ProfileInput): Promise<ApiUser> {
  await api.get("/sanctum/csrf-cookie", { timeout: 15000 });
  return (await api.patch<{ data: ApiUser }>("/api/v1/me", input, { timeout: 30000 })).data.data;
}

export async function uploadAvatar(file: File): Promise<ApiUser> {
  await api.get("/sanctum/csrf-cookie", { timeout: 15000 });
  const form = new FormData();
  form.append("avatar", file);
  // Let the browser supply the multipart boundary.
  return (await api.post<{ data: ApiUser }>("/api/v1/me/avatar", form, { timeout: 90000 })).data.data;
}

export function profileError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401 || status === 419) return "登入狀態已失效，請重新登入。";
    if (status === 413) return "圖片太大，請選擇較小的圖片（最多 5 MB）。";
    if (status === 429) return "操作過於頻繁，請稍後再試。";
    if (status === 404 || status === 405) return "個人資料服務尚未部署完成，請稍後再試。";
    const data = error.response?.data;
    if (status === 422 && data?.errors) return Object.values(data.errors).flat().join(" ");
    if (status === 503 && typeof data?.message === "string") return data.message;
  }
  return "無法確認儲存結果，請重新整理確認後再試。";
}
