import axios from "axios";
import { api } from "@/lib/api";

export type CreatorApplicationOptions = {
  categories: string[];
  contractVersion: string;
  contractHash: string;
  contractContent: string;
  maxImageBytes: number;
  imageTypes: string[];
};

export type MyCreatorApplication = {
  id: string;
  status: "pending" | "approved" | "rejected";
  date: string;
  rejectReason: string | null;
};

export async function creatorApplicationOptions(signal: AbortSignal) {
  return (await api.get<{ data: CreatorApplicationOptions }>("/api/v1/creator-applications/options", { signal, timeout: 15000 })).data.data;
}

export async function myCreatorApplication(signal: AbortSignal) {
  return (await api.get<{ data: MyCreatorApplication | null }>("/api/v1/creator-applications/me", { signal, timeout: 15000 })).data.data;
}

export async function submitCreatorApplication(body: FormData) {
  await api.get("/sanctum/csrf-cookie", { timeout: 15000 });
  return (await api.post<{ data: MyCreatorApplication }>("/api/v1/creator-applications", body, { timeout: 90000 })).data.data;
}

export function applicationError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401 || status === 419) return "登入狀態已失效，請重新登入後再確認申請狀態。";
    if (status === 403) return "目前帳號無法執行此操作。";
    if (status === 404 || status === 405) return "創作者申請服務尚未部署完成，請稍後再試。";
    if (status === 413) return "上傳資料超過伺服器限制，請縮小圖片後重新送出。";
    if (status === 429) return "操作過於頻繁，請稍候再試。";
    const data = error.response?.data;
    if (status === 422 && data?.errors) return Object.values(data.errors).flat().join(" ");
    if ([409, 503].includes(status ?? 0) && typeof data?.message === "string") return data.message;
  }
  return "目前無法確認申請結果，請先查詢申請狀態，或重試原申請。";
}

// These responses reject the request before creating an application.
export function applicationCanEdit(error: unknown): boolean {
  return axios.isAxiosError(error) && [413, 422].includes(error.response?.status ?? 0);
}
