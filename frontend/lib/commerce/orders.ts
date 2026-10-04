import type { Product, ProductType } from "../../types/admin";
import { cartGroupId, cartLineIssue, shippingFor, type CartLine } from "./cart";

export const ORDERS_STORAGE_KEY = "artniverse_orders_v1";
export type CheckoutContact = { name: string; phone: string; email: string; address: string; paymentMethod: "card" | "transfer" };
export type OrderItem = CartLine & { name: string; image: string; price: number };
export type CheckoutOrder = {
  id: string; draftId: string; groupId: string; creatorId: string; creatorName: string; productType: ProductType;
  items: OrderItem[]; contact: CheckoutContact; subtotal: number; shipping: number; total: number;
  createdAt: number; paymentDeadline: number; status: "pending" | "failed" | "paid" | "expired"; paidAt?: number;
};

export function checkoutItems(lines: CartLine[], products: Product[], groupId: string, now: number): OrderItem[] {
  const selected = lines.filter(line => {
    const product = products.find(p => p.id === line.productId);
    return product && cartGroupId(product) === groupId;
  });
  if (!selected.length) throw new Error("此組購物車沒有商品，請返回購物車重新選擇。");
  return selected.map(line => {
    const product = products.find(p => p.id === line.productId)!;
    const issue = cartLineIssue(line, product, now);
    if (issue) throw new Error(`${product.name}：${issue}`);
    if (!Number.isSafeInteger(line.quantity) || line.quantity < 1 || (product.productType === "auction" && line.quantity !== 1)) throw new Error("商品數量不正確。");
    return { ...line, name: product.name, image: product.image, price: product.productType === "auction" ? line.award!.amount : product.price };
  });
}

export function createCheckoutOrder(lines: CartLine[], products: Product[], groupId: string, draftId: string, contact: CheckoutContact, now: number): CheckoutOrder {
  if (!contact.name.trim() || !contact.address.trim() || !/^[0-9+()\s-]{8,20}$/.test(contact.phone) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email) || !["card", "transfer"].includes(contact.paymentMethod)) throw new Error("請完整填寫收件人、電話、Email、地址及付款方式。");
  const items = checkoutItems(lines, products, groupId, now);
  const product = products.find(p => p.id === items[0].productId)!;
  const subtotal = Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;
  const shipping = shippingFor(subtotal);
  return {
    id: `ORD-${draftId}`, draftId, groupId, creatorId: product.creatorId!, creatorName: product.creatorName ?? `創作者賣場 ${product.creatorId}`,
    productType: product.productType, items, contact, subtotal, shipping, total: subtotal + shipping,
    createdAt: now, paymentDeadline: product.productType === "auction" ? items[0].award!.deadline : now + 86400000, status: "pending",
  };
}

export function paymentStatus(order: CheckoutOrder, now: number): CheckoutOrder["status"] {
  return order.status === "paid" ? "paid" : now >= order.paymentDeadline ? "expired" : order.status;
}

export function applyPayment(order: CheckoutOrder, succeeded: boolean, now: number): CheckoutOrder {
  const status = paymentStatus(order, now);
  if (status === "paid" || status === "expired") return { ...order, status };
  return { ...order, status: succeeded ? "paid" : "failed", ...(succeeded ? { paidAt: now } : {}) };
}

// Frontend preview persistence; replace with authenticated order APIs in the integration branch.
export function readOrders(): CheckoutOrder[] {
  const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.some(order => !order || typeof order.id !== "string" || !Array.isArray(order.items) || !order.contact || !Number.isFinite(order.paymentDeadline) || !Number.isFinite(order.total) || !["pending", "failed", "paid", "expired"].includes(order.status))) throw new Error("無法讀取此裝置的訂單資料，請勿重複送單。");
  return parsed;
}

export function saveNewOrder(order: CheckoutOrder): CheckoutOrder {
  const orders = readOrders();
  const existing = orders.find(item => item.draftId === order.draftId);
  if (existing) return existing;
  if (order.productType === "auction" && orders.some(item => item.productType === "auction" && item.items.some(line => line.productId === order.items[0].productId))) throw new Error("此得標商品已有訂單，請使用該訂單的付款連結繼續。");
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([order, ...orders]));
  return order;
}

export function payOrder(id: string, succeeded: boolean, now: number): CheckoutOrder {
  const orders = readOrders();
  const order = orders.find(item => item.id === id);
  if (!order) throw new Error("找不到訂單。");
  const updated = applyPayment(order, succeeded, now);
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders.map(item => item.id === id ? updated : item)));
  return updated;
}
