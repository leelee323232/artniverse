import axios from "axios";
import { api } from "@/lib/api";

export const methodLabels = { card: "信用卡", line_pay: "LINE Pay", atm: "ATM 虛擬帳號" };
export const statusLabels: Record<string, string> = {
  pending: "待付款／待確認入帳", processing: "付款處理中", unknown: "交易狀態待確認",
  authorized: "已授權", paid: "已付款", failed: "付款失敗", cancelled: "付款已取消",
  expired: "付款已逾期", refunded: "已退款", partially_refunded: "部分退款",
};
export type PaymentMethod = keyof typeof methodLabels;
export type OrderSummary = {
  id: string; environment: string; currency: string; created_at: string | null; updated_at: string | null;
  payment_method: PaymentMethod; payment_status: string; expires_at: string; payment_deadline_passed: boolean; can_pay: boolean;
  subtotal: number; shipping: number; total: number;
  items: { product_id: number; name: string; creator_id: string; unit_price: number; quantity: number }[];
  payment: null | {
    id: string; status: string; payment_method: PaymentMethod; bank_transaction_id: string;
    rec_trade_id: string | null; gateway_status: number | null; record_status: number | null;
    payment_expires_at: string | null; updated_at: string | null; can_transfer: boolean;
  };
};
export type OrderDetail = Omit<OrderSummary, "payment"> & {
  contact: { name: string; phone: string; email: string; address: string };
  payment: (NonNullable<OrderSummary["payment"]> & {
    payment_url: string | null;
    payee_info: { vacc_bank_code: string; vacc_no: string; expire_time: string } | null;
  }) | null;
};
export type OrderPage = {
  data: OrderSummary[];
  meta: { current_page: number; per_page: number; last_page: number; total: number; from: number | null; to: number | null; has_more_pages: boolean };
};
export const orderUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function listMyOrders(page: number, method: string, status: string, signal: AbortSignal): Promise<OrderPage> {
  return (await api.get<OrderPage>("/api/v1/orders", { signal, timeout: 15000, params: {
    page, per_page: 20, ...(method ? { payment_method: method } : {}), ...(status ? { payment_status: status } : {}),
  } })).data;
}
export async function getMyOrder(id: string, signal: AbortSignal): Promise<OrderDetail> {
  return (await api.get<{ data: OrderDetail }>(`/api/v1/orders/${encodeURIComponent(id)}`, { signal, timeout: 15000 })).data.data;
}
export async function refreshMyOrder(id: string, signal: AbortSignal): Promise<OrderDetail> {
  await api.get("/sanctum/csrf-cookie", { signal, timeout: 15000 });
  return (await api.post<{ data: OrderDetail }>(`/api/v1/checkout/orders/${encodeURIComponent(id)}/refresh`, {}, { signal, timeout: 90000 })).data.data;
}
export function orderError(error: unknown, detail = false): string {
  if (axios.isAxiosError(error)) {
    switch (error.response?.status) {
      case 401: case 419: return "登入狀態已失效，請另開分頁登入後回此頁重新載入。";
      case 403: return "無法存取此訂單，請確認登入帳號。";
      case 404: return detail ? "找不到此訂單，請確認登入的是原訂單帳號；若持續發生，請確認訂單 API 已部署。" : "訂單列表服務尚未部署（404），請聯繫管理員。";
      case 429: return "查詢過於頻繁，請稍後再試。";
    }
    if ([409, 422, 502, 503].includes(error.response?.status ?? 0) && typeof error.response?.data?.message === "string") return error.response.data.message;
  }
  return "目前無法取得訂單資料，請稍後重新載入；請勿重複付款。";
}
export function retryDelay(error: unknown): number {
  if (!axios.isAxiosError(error) || error.response?.status !== 429) return 0;
  const header = error.response.headers["retry-after"];
  const seconds = Number(header);
  const date = Date.parse(String(header));
  return Math.max(1, Number.isFinite(seconds) && seconds > 0 ? seconds : Number.isFinite(date) ? Math.ceil((date - Date.now()) / 1000) : 30);
}
export const orderDate = (value: string | null | undefined) => value && Number.isFinite(Date.parse(value))
  ? new Date(value).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", hour12: false }) : "尚無資料";
export const orderMoney = (value: number, currency = "TWD") => `${currency === "TWD" ? "NT$" : currency} ${value.toLocaleString("zh-TW")}`;
export function orderStatus(order: OrderSummary): string {
  if (order.payment_status === "pending") {
    if (!order.payment) return "尚未付款";
    if (order.payment_method === "atm" && order.payment.payment_expires_at) return "已取號，待確認入帳";
    if (order.payment_method === "line_pay") return "LINE Pay 待確認付款";
    return "付款處理中";
  }
  return statusLabels[order.payment_status] ?? "交易狀態待確認";
}
