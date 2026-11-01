"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { draftKey, type CheckoutDraft } from "@/lib/commerce/checkout-api";
import { api } from "@/lib/api";
import { catalogError as apiError } from "@/lib/commerce/catalog-api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";

interface ApiCartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  creator: string;
  stock?: number;
  isAvailable?: boolean;
}

export function ApiCart() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <p>載入購物車中…</p>;
  return user ? <SignedInCart key={String(user.id)} owner={String(user.id)} /> : <p>請先<Link href="/login" className="underline">登入</Link>以查看購物車。</p>;
}

function SignedInCart({ owner }: { owner: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [items, setItems] = useState<ApiCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    api.get<{ data: ApiCartItem[] }>("/api/v1/cart", { signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setItems(data.data); })
      .catch((err) => { if (!controller.signal.aborted) setError(apiError(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reload]);

  const chosen = items.filter(item => selected.includes(item.id));
  const unavailable = (item: ApiCartItem) => item.isAvailable === false || (item.stock !== undefined && item.quantity > item.stock);
  function checkout() {
    if (busy.current || loading || error || !chosen.length || chosen.length > 30 || chosen.some(unavailable)) return;
    try {
      const id = crypto.randomUUID();
      const draft: CheckoutDraft = { owner, items: chosen };
      sessionStorage.setItem(draftKey(owner, id), JSON.stringify(draft));
      router.push(`/checkout?source=api&draft=${id}`);
    } catch { setError("無法保存結帳資料，請允許瀏覽器儲存空間後重試。"); }
  }

  async function mutate(item: ApiCartItem, quantity?: number) {
    if (busy.current || loading) return;
    busy.current = true;
    setSaving(true);
    setError("");
    try {
      await api.get("/sanctum/csrf-cookie");
      const url = `/api/v1/cart/${encodeURIComponent(item.id)}`;
      if (quantity == null) await api.delete(url);
      else await api.patch(url, { quantity });
      window.dispatchEvent(new Event("artniverse-cart-updated"));
      setLoading(true);
      setReload((value) => value + 1);
    } catch (err) {
      setError(apiError(err));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  if (!loading && !error && items.length === 0) return <Card className="space-y-4 p-6"><p>購物車是空的。</p><Link href="/shop" className="underline">繼續逛商店</Link></Card>;
  return (
    <section aria-label="資料庫購物車" className="mb-8">
      <Card className="border-border/50 bg-card/40 p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-bold">已加入的商品</h2>
        {loading && <p role="status">載入購物車中…</p>}
        {error && <p role="alert" className="mb-4 text-destructive">
          {error} <Button variant="outline" disabled={loading || saving} onClick={() => setReload((value) => value + 1)}>重試</Button>
        </p>}
        <div className="divide-y divide-border/50">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 py-5">
              <input type="checkbox" className="mt-2 h-4 w-4 shrink-0" aria-label={`選擇${item.name}結帳`} checked={selected.includes(item.id)} disabled={loading || saving || unavailable(item)} onChange={e => setSelected(previous => e.target.checked ? [...previous, item.id] : previous.filter(id => id !== item.id))} />
              <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-20 w-20 shrink-0 rounded-lg object-cover sm:h-24 sm:w-24" />
              <div className="min-w-0 flex-1 space-y-2">
                <Link href={{ pathname: "/product", query: { id: item.productId, source: "api" } }} className="block break-words font-bold hover:underline">{item.name}</Link>
                <p className="text-sm text-muted-foreground">{item.creator}</p>
                <p className="font-semibold text-primary">NT$ {item.price.toLocaleString("zh-TW")}</p>
                {unavailable(item) && <p className="text-sm text-destructive">商品已下架或庫存不足，請調整購物車。</p>}
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="icon" aria-label={`減少${item.name}數量`} disabled={saving || loading || item.quantity <= 1} onClick={() => void mutate(item, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                  <span className="min-w-8 text-center">{item.quantity}</span>
                  <Button variant="outline" size="icon" aria-label={`增加${item.name}數量`} disabled={saving || loading || unavailable(item) || item.quantity >= Math.min(item.stock ?? 99, 99)} onClick={() => void mutate(item, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="ml-auto text-destructive" aria-label={`移除${item.name}`} disabled={saving || loading} onClick={() => void mutate(item)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && <div className="mt-4 border-t border-border pt-4">
          <p className="flex justify-between font-bold"><span>商品小計（不含運費）</span><span>NT$ {items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString("zh-TW")}</span></p>
          <p className="mt-3 text-sm text-muted-foreground">請勾選同一位創作者的一般商品結帳，每筆最多 30 項。金額與庫存以後端建單結果為準。</p>
          <p className="my-3">已選 {chosen.length} 項・NT$ {chosen.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString("zh-TW")}（不含運費）</p>
          <Button disabled={loading || saving || !!error || !chosen.length || chosen.length > 30 || chosen.some(unavailable)} onClick={checkout}>前往結帳</Button>
        </div>}
      </Card>
    </section>
  );
}
