"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import type { AuctionAward, CartLine } from "./cart";

type Result = { ok: boolean; message: string };
type CartContextValue = {
  items: CartLine[]; awards: AuctionAward[]; ready: boolean; now: number; storageWarning: string;
  addItem: (id: string, quantity?: number, award?: AuctionAward) => Result;
};
const CartContext = createContext<CartContextValue | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [snapshot, setSnapshot] = useState<{ owner: string; items: CartLine[] }>({ owner: "", items: [] });
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(0);
  const owner = user ? String(user.id) : "";
  useEffect(() => {
    let controller: AbortController | null = null;
    const load = () => {
      controller?.abort(); controller = new AbortController();
      const signal = controller.signal;
      setReady(false); setSnapshot({ owner, items: [] });
      if (!owner || isLoading) { setReady(!isLoading); return; }
      void api.get<{ data: { productId: string; quantity: number }[] }>("/api/v1/cart", { signal, timeout: 15000 })
        .then(({ data }) => { if (!signal.aborted) setSnapshot({ owner, items: data.data.map(item => ({ productId: String(item.productId), quantity: item.quantity })) }); })
        .catch(() => {})
        .finally(() => { if (!signal.aborted) setReady(true); });
    };
    load(); window.addEventListener("artniverse-cart-updated", load);
    return () => { controller?.abort(); window.removeEventListener("artniverse-cart-updated", load); };
  }, [owner, isLoading]);
  useEffect(() => { setNow(Date.now()); const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  // The old auction demo cannot create real cart lines or pretend to award products.
  const addItem = (): Result => ({ ok: false, message: "示範購物流程已停用，請從商店選購一般商品。" });
  return <CartContext.Provider value={{ items: snapshot.owner === owner ? snapshot.items : [], awards: [], ready, now, storageWarning: "", addItem }}>{children}</CartContext.Provider>;
}
export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart requires CartProvider");
  return value;
}
