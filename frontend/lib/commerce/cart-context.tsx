"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { mockProducts } from "@/mocks/admin/products";
import { addCartItem, CART_STORAGE_KEY, emptyCart, normalizeProductId, purchaseIssue, readCart, type AuctionAward, type CartLine, type CartState } from "./cart";

type Result = { ok: boolean; message: string };
type CartContextValue = CartState & {
  ready: boolean; now: number; storageWarning: string;
  addItem: (id: string, quantity?: number, award?: AuctionAward) => Result;
  setQuantity: (id: string, quantity: number) => Result;
  removeItem: (id: string) => void;
  removePurchased: (lines: CartLine[]) => void;
};
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(emptyCart);
  const current = useRef(state);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(0);
  const [storageWarning, setStorageWarning] = useState("");
  useEffect(() => {
    try { current.current = readCart(localStorage.getItem(CART_STORAGE_KEY)); setState(current.current); }
    catch { setStorageWarning("瀏覽器無法保存購物車；關閉頁面後可能遺失內容。"); }
    setReady(true); setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    const sync = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY || event.key === null) { current.current = readCart(event.newValue); setState(current.current); }
    };
    window.addEventListener("storage", sync);
    return () => { window.clearInterval(timer); window.removeEventListener("storage", sync); };
  }, []);
  function commit(next: CartState) {
    current.current = next; setState(next);
    try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next)); }
    catch { setStorageWarning("瀏覽器無法保存購物車；關閉頁面後可能遺失內容。"); }
  }
  function latest() {
    // Refresh before mutations to avoid overwriting changes from another tab.
    try { const raw = localStorage.getItem(CART_STORAGE_KEY); if (raw !== null) current.current = readCart(raw); } catch { /* in-memory fallback */ }
    return current.current;
  }
  function addItem(id: string, quantity = 1, award?: AuctionAward): Result {
    if (!ready) return { ok: false, message: "購物車載入中，請稍候" };
    const product = mockProducts.find(p => p.id === normalizeProductId(id));
    const result = addCartItem(latest(), product, quantity, Date.now(), award);
    if (result.error) return { ok: false, message: result.error };
    commit(result.state);
    return { ok: true, message: `${product!.name} 已加入購物車` };
  }
  function setQuantity(id: string, quantity: number): Result {
    if (!ready) return { ok: false, message: "購物車載入中" };
    const state = latest();
    const line = state.items.find(i => i.productId === id);
    const product = mockProducts.find(p => p.id === id);
    if (!line || !product) return { ok: false, message: "找不到商品" };
    const issue = purchaseIssue(product, Date.now(), line.award);
    if (issue) return { ok: false, message: issue };
    if (product.productType === "auction") return { ok: false, message: "得標數量固定為 1 件／組" };
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > product.stock) return { ok: false, message: `數量須介於 1 至 ${product.stock} 件` };
    commit({ ...state, items: state.items.map(i => i.productId === id ? { ...i, quantity } : i) });
    return { ok: true, message: "已更新數量" };
  }
  function removeItem(id: string) { if (ready) { const state = latest(); commit({ ...state, items: state.items.filter(i => i.productId !== id) }); } }
  function removePurchased(lines: CartLine[]) {
    const state = latest();
    commit({ ...state, items: state.items.flatMap(item => {
      const purchased = lines.find(line => line.productId === item.productId);
      if (!purchased) return [item];
      const remaining = item.quantity - purchased.quantity;
      return remaining > 0 ? [{ ...item, quantity: remaining }] : [];
    }) });
  }
  return <CartContext.Provider value={{ ...state, ready, now, storageWarning, addItem, setQuantity, removeItem, removePurchased }}>{children}</CartContext.Provider>;
}
export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart requires CartProvider");
  return value;
}
