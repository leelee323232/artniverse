import axios from "axios";
import { api } from "@/lib/api";
import type { ProductApplication, ProductApplicationStatus } from "@/types/admin";

export interface ProductDetail {
  id: string; name: string; isNew: boolean; price: number; originalPrice: number | null;
  images: string[]; category: string; categoryId: string; stock: number; sold: number;
  rating: number; reviewCount: number; creatorId: string | null; creatorName: string | null;
  description: string; features: string[]; specifications: Record<string, string>;
}
export interface Review {
  id: number; userName: string; avatar: string | null; rating: number; date: string;
  content: string; images: string[]; helpful: number; verified: boolean;
}
export interface Page<T> { data: T[]; meta: { current_page: number; last_page: number; total: number } }
export interface ProductResponse {
  data: ProductDetail;
  reviewDistribution: { star: number; count: number; percentage: number }[];
  recommendedProducts: ProductDetail[];
}
export type Application = Omit<ProductApplication, "templateFile" | "baseCost" | "printingCost" | "productionCost" | "stockingCost" | "sellingPrice" | "preOrderQuantity" | "customRequest" | "rejectReason"> & {
  name: string; description: string | null; note: string | null;
  saleType: "general" | "auction" | "presale";
  templateFile: { name: string; url: string; size: number | null } | null;
  baseCost: number | null; printingCost: number | null; productionCost: number | null;
  stockingCost: number | null; sellingPrice: number | null; preOrderQuantity: number | null;
  customRequest: string | null; rejectReason: string | null;
  auctionStartPrice: string | null; auctionMinIncrement: string | null;
  auctionStartTime: string | null; auctionEndTime: string | null;
  presaleTargetQuantity: number | null; presaleStartDate: string | null; presaleEndDate: string | null;
};
export const getProduct = async (id: string, signal?: AbortSignal) =>
  (await api.get<ProductResponse>(`/api/v1/product/${encodeURIComponent(id)}`, { signal })).data;
export const getReviews = async (id: string, page = 1, signal?: AbortSignal) =>
  (await api.get<Page<Review>>(`/api/v1/product/${encodeURIComponent(id)}/reviews`, { params: { page }, signal })).data;
export const getApplications = async (page = 1, status = "", signal?: AbortSignal) =>
  (await api.get<Page<Application>>("/api/v1/admin/product-applications", { params: { page, ...(status ? { status } : {}) }, signal })).data;
export async function reviewApplication(application: Application, status: ProductApplicationStatus, reason?: string) {
  await api.get("/sanctum/csrf-cookie");
  return (await api.patch<{ data: Application }>(`/api/v1/admin/product-applications/${application.id}`, {
    status, expectedStatus: application.status, reason,
  })).data.data;
}
export async function addToCart(productId: string, quantity: number) {
  await api.get("/sanctum/csrf-cookie");
  await api.post(`/api/v1/product/${productId}/cart`, { quantity });
}
export function apiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) return "請先登入後再操作。";
    if (error.response?.status === 403) return "此帳號沒有管理員權限。";
    if (error.response?.status === 404) return "找不到資料，商品可能已下架。";
    if (error.response?.status === 419) return "登入狀態已過期，請重新登入。";
    if (error.response?.data?.errors) return Object.values(error.response.data.errors).flat().join(" ");
    if (error.response?.status === 409 || error.response?.status === 422) return error.response.data.message;
  }
  return "暫時無法載入或儲存資料，請稍後重試。";
}

