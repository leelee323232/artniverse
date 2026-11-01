import axios from "axios";
import { api } from "@/lib/api";

export type ApplicationStatus = "pending" | "approved" | "rejected";
export type ApplicationSummary = {
  id: string;
  date: string;
  status: ApplicationStatus;
  version: number;
  rejectReason?: string | null;
  email: string;
  realName: string;
  brandName: string;
  phone: string;
  selectedCategories: string[];
  isDemo?: boolean;
};
export type CreatorApplication = ApplicationSummary & {
  storePickup: string;
  birthday: string;
  address: string;
  bankCode: string;
  bankAccount: string;
  creativePhilosophy: string;
  idFrontImage: string;
  idBackImage: string;
  agreeToContract: boolean;
  contractVersion?: string;
  contractContent?: string;
  consentedAt?: string;
  reviewHistory?: {
    from_status: ApplicationStatus;
    to_status: ApplicationStatus;
    reason: string | null;
    reviewer_id: number;
    created_at: string;
  }[];
};
export type ApplicationPage = {
  data: ApplicationSummary[];
  meta: { current_page: number; last_page: number; total: number; per_page: number };
};
const endpoint = "/api/v1/admin/creator-applications";

export async function listCreatorApplications(page: number, signal: AbortSignal) {
  return (await api.get<ApplicationPage>(endpoint, { params: { page }, signal, timeout: 15000 })).data;
}
export async function getCreatorApplication(id: string, signal: AbortSignal) {
  return (await api.get<{ data: CreatorApplication }>(`${endpoint}/${encodeURIComponent(id)}`, { signal, timeout: 15000 })).data.data;
}
export async function reviewCreatorApplication(application: CreatorApplication, status: ApplicationStatus, reason?: string) {
  // Demo IDs must never reach a write endpoint, even if called outside the page.
  if (application.isDemo || !/^\d+$/.test(application.id)) throw new Error("示範資料不可送出審核。");
  await api.get("/sanctum/csrf-cookie", { timeout: 15000 });
  return (await api.patch<{ data: CreatorApplication }>(`${endpoint}/${application.id}`, {
    status, expectedStatus: application.status, expectedVersion: application.version,
    reason: reason?.trim() || null,
  }, { timeout: 30000 })).data.data;
}
export async function getCreatorDocument(id: string, side: "front" | "back", signal: AbortSignal) {
  const response = await api.get<Blob>(`${endpoint}/${encodeURIComponent(id)}/documents/${side}`, {
    responseType: "blob", signal, timeout: 30000,
  });
  if (!["image/jpeg", "image/png", "image/webp"].includes(response.data.type.split(";")[0])) {
    throw new Error("證件回應不是支援的圖片格式。");
  }
  return response.data;
}
export function creatorReviewError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401 || status === 419) return "登入已失效，請重新登入後再載入。";
    if (status === 403) return "僅管理員可查看及審核創作者申請。";
    if (status === 404) return "找不到申請、證件或對應服務，請重新載入確認。";
    if (status === 429) return "操作過於頻繁，請稍候再試。";
    const data = error.response?.data;
    if (status === 422 && data?.errors) return Object.values(data.errors).flat().join(" ");
    if ([409, 503].includes(status ?? 0) && typeof data?.message === "string") return data.message;
  }
  return "操作未完成或結果尚未確認，請重新載入最新資料後再操作。";
}
