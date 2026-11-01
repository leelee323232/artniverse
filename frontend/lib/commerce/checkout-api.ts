import axios from "axios";
import { api } from "@/lib/api";

export type Contact = { name: string; email: string; phone: string; address: string };
export type CartApiItem = { id: string; productId: string; name: string; price: number; quantity: number; image: string; creator: string; stock?: number; isAvailable?: boolean };
export type PaymentMethod = "card" | "line_pay" | "atm";
export const paymentLabels: Record<PaymentMethod, string> = { card: "信用卡", line_pay: "LINE Pay", atm: "ATM 虛擬帳號" };
export const paymentMethods: PaymentMethod[] = ["card", "line_pay", "atm"];
export type OrderInput = { idempotency_key: string; items: { product_id: number; quantity: number }[]; contact: Contact; payment_method?: PaymentMethod };
export type CheckoutDraft = { owner: string; items: CartApiItem[]; submitted?: OrderInput; orderId?: string };
export type TapPayConfig = { enabled: boolean; ready: boolean; environment: string; app_id: number; app_key: string; methods: string[]; three_domain_secure: boolean; missing: string[]; method_settings?: Partial<Record<PaymentMethod, { enabled: boolean; ready: boolean; missing: string[]; min_amount: number; max_amount: number }>> };
export function methodReady(config: TapPayConfig | null, method: PaymentMethod): boolean {
  return !!config?.enabled && config.ready && config.environment === "sandbox" && config.methods.includes(method) && (config.method_settings?.[method]?.ready ?? (method === "card"));
}
export type ApiOrder = {
  id: string; environment: string; currency: string; subtotal: number; shipping: number; total: number; payment_method?: PaymentMethod;
  items: { product_id: number; name: string; creator_id: string; unit_price: number; quantity: number }[];
  contact: Contact; payment_status: string; expires_at: string; can_pay: boolean;
  payment: null | { id: string; status: string; bank_transaction_id: string; rec_trade_id: string | null; gateway_status: number | null; record_status: number | null; payment_url: string | null; payment_method?: PaymentMethod; payee_info?: { vacc_bank_code: string; vacc_no: string; expire_time: string } | null; payment_expires_at?: string | null; can_transfer?: boolean };
};
export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const draftKey = (owner: string, id: string) => `artniverse_api_checkout_${owner}_${id}`;
export const getPaymentConfig = async (signal?: AbortSignal) => (await api.get<{ data: TapPayConfig }>("/api/v1/payments/tappay/config", { signal, timeout: 15000 })).data.data;
export const getApiOrder = async (id: string, signal?: AbortSignal) => (await api.get<{ data: ApiOrder }>(`/api/v1/checkout/orders/${encodeURIComponent(id)}`, { signal, timeout: 15000 })).data.data;
export async function checkoutPost<T>(path: string, body: unknown): Promise<T> {
  await api.get("/sanctum/csrf-cookie", { timeout: 15000 });
  return (await api.post<{ data: T }>(path, body, { timeout: 90000 })).data.data;
}
export const createApiOrder = (input: OrderInput) => checkoutPost<ApiOrder>("/api/v1/checkout/orders", input);
export const payApiOrder = (id: string, prime: string, payment_method: PaymentMethod) => checkoutPost<ApiOrder>(`/api/v1/checkout/orders/${encodeURIComponent(id)}/pay`, { prime, payment_method });
export const refreshApiOrder = (id: string) => checkoutPost<ApiOrder>(`/api/v1/checkout/orders/${encodeURIComponent(id)}/refresh`, {});
export function checkoutError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401 || status === 419) return "登入狀態已失效，請登入後回到此頁繼續。";
    if (status === 403) return "目前無法執行此操作，請確認帳戶與登入狀態。";
    if (status === 404) {
      const path = (error.config?.url ?? "").split("?")[0].replace(/\/+$/, "");
      if (path.endsWith("/payments/tappay/config")) return "付款設定服務不存在或尚未部署（404），請聯繫網站管理員。此時尚未建立訂單。";
      if (path.endsWith("/sanctum/csrf-cookie")) return "登入驗證服務無法連線（404），請聯繫網站管理員確認 API 設定。";
      if (path.endsWith("/checkout/orders")) return "無法建立訂單（404），可能是結帳服務尚未部署或商品已不存在，請聯繫網站管理員。";
      if (path.endsWith("/cart")) return "購物車服務不存在或尚未部署（404），請聯繫網站管理員。";
      return "無法取得訂單（404），請確認訂單連結與登入帳號；若持續發生，請聯繫網站管理員確認結帳服務。";
    }
    if (status === 429) return "操作過於頻繁，請稍後再試。";
    const data = error.response?.data;
    if (data?.errors && typeof data.errors === "object") return Object.values(data.errors).flat().join(" ");
    if ([409, 422, 502, 503].includes(status ?? 0) && typeof data?.message === "string") return data.message;
    return "連線中斷或服務暫時無法回應；請查詢原訂單，勿重複建立或付款。";
  }
  return error instanceof Error ? error.message : "操作失敗，請稍後再試。";
}
