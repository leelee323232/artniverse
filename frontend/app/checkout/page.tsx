"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/commerce/cart-context";
import { CART_STORAGE_KEY, readCart, TYPE_LABEL } from "@/lib/commerce/cart";
import { checkoutItems, createCheckoutOrder, readOrders, saveNewOrder, type CheckoutContact } from "@/lib/commerce/orders";
import { mockProducts } from "@/mocks/admin/products";
import { shippingFor } from "@/lib/commerce/cart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const money = (value: number) => `NT$ ${value.toLocaleString("zh-TW")}`;
export default function CheckoutPage() { return <Suspense fallback={<p>結帳資料載入中…</p>}><CheckoutForm /></Suspense>; }

function CheckoutForm() {
  const params = useSearchParams();
  const groupId = params.get("group") ?? "";
  const draftId = params.get("draft") ?? "";
  const router = useRouter();
  const { items, ready, now, removePurchased } = useCart();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const locked = useRef(false);
  const [contact, setContact] = useState<CheckoutContact>({ name: "", phone: "", email: "", address: "", paymentMethod: "card" });

  useEffect(() => {
    if (!draftId) return;
    try {
      const existing = readOrders().find(order => order.draftId === draftId);
      if (existing) router.replace(`/checkout/payment?order=${encodeURIComponent(existing.id)}`);
      else {
        const saved = sessionStorage.getItem(`artniverse_checkout_${draftId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && ["name", "phone", "email", "address"].every(key => typeof parsed[key] === "string") && ["card", "transfer"].includes(parsed.paymentMethod)) setContact(parsed);
        }
      }
    } catch { setError("無法讀取儲存資料，請確認瀏覽器允許儲存後再試。"); }
  }, [draftId, router]);

  function updateContact(key: keyof CheckoutContact, value: string) {
    const next = { ...contact, [key]: value };
    setContact(next);
    try { sessionStorage.setItem(`artniverse_checkout_${draftId}`, JSON.stringify(next)); } catch { /* Form remains usable in memory. */ }
  }

  let issue = "";
  let selected: ReturnType<typeof checkoutItems> = [];
  if (ready) {
    try {
      if (!groupId || !draftId) throw new Error("請先從購物車選擇賣場前往結帳。");
      selected = checkoutItems(items, mockProducts, groupId, now);
    } catch (e) { issue = e instanceof Error ? e.message : "無法讀取商品"; }
  }
  const product = mockProducts.find(p => p.id === selected[0]?.productId);
  const subtotal = Math.round(selected.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;
  const shipping = shippingFor(subtotal);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current) return;
    locked.current = true; setSubmitting(true); setError("");
    try {
      const existing = readOrders().find(order => order.draftId === draftId);
      if (existing) { router.replace(`/checkout/payment?order=${encodeURIComponent(existing.id)}`); return; }
      // Check current cart again at submission, including changes in another tab.
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      const latestItems = raw === null ? items : readCart(raw).items;
      const fresh = checkoutItems(latestItems, mockProducts, groupId, Date.now());
      if (JSON.stringify(fresh) !== JSON.stringify(selected)) throw new Error("購物車已變更，請返回購物車確認後再結帳。");
      const order = saveNewOrder(createCheckoutOrder(latestItems, mockProducts, groupId, draftId, contact, Date.now()));
      removePurchased(order.items);
      try { sessionStorage.removeItem(`artniverse_checkout_${draftId}`); } catch { /* Order has already been saved. */ }
      router.replace(`/checkout/payment?order=${encodeURIComponent(order.id)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "無法儲存訂單，請確認瀏覽器允許儲存後重試。");
      locked.current = false; setSubmitting(false);
    }
  }

  return <>
    <Link href="/cart" className="text-sm text-muted-foreground hover:underline">← 返回購物車</Link>
    <h1 className="mt-4 text-3xl font-bold">結帳</h1>
    <p className="mt-2 mb-6 text-muted-foreground">填寫收件資料 → 建立訂單 → 付款</p>
    <p className="mb-6 rounded-lg bg-muted/30 p-3 text-sm">目前為前端示範流程，不會實際扣款或出貨。可填寫示範收件資料。</p>
    {!ready || submitting ? <p role="status">{submitting ? "訂單已建立，正在前往付款…" : "商品載入中…"}</p> : issue ? <Card className="p-6"><p role="alert" className="mb-4 text-destructive">{issue}</p><Button asChild><Link href="/cart">返回購物車</Link></Button></Card> :
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <fieldset disabled={submitting} className="min-w-0 space-y-6">
          <Card className="space-y-4 bg-card/50 p-5">
            <h2 className="text-xl font-bold">收件資料</h2>
            <div className="space-y-2"><Label htmlFor="recipient">收件人姓名</Label><Input id="recipient" autoComplete="shipping name" required maxLength={60} value={contact.name} onChange={e => updateContact("name", e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="phone">聯絡電話</Label><Input id="phone" type="tel" autoComplete="shipping tel" required minLength={8} maxLength={20} title="請輸入 8 至 20 字元的聯絡電話" value={contact.phone} onChange={e => updateContact("phone", e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" required value={contact.email} onChange={e => updateContact("email", e.target.value)} /></div>
            <p className="text-sm text-muted-foreground">配送方式：宅配到府</p>
            <div className="space-y-2"><Label htmlFor="address">收件地址</Label><Input id="address" autoComplete="shipping street-address" required maxLength={200} value={contact.address} onChange={e => updateContact("address", e.target.value)} /></div>
          </Card>
          <Card className="space-y-4 bg-card/50 p-5">
            <h2 className="text-xl font-bold">付款方式</h2>
            <label className="flex items-center gap-3"><input type="radio" name="payment" value="card" checked={contact.paymentMethod === "card"} onChange={() => updateContact("paymentMethod", "card")} />信用卡（示範）</label>
            <label className="flex items-center gap-3"><input type="radio" name="payment" value="transfer" checked={contact.paymentMethod === "transfer"} onChange={() => updateContact("paymentMethod", "transfer")} />ATM 轉帳（示範）</label>
            <p className="text-sm text-muted-foreground">{product?.productType === "auction" ? `須於原得標期限 ${new Date(selected[0].award!.deadline).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })} 前付款，下單不延長期限。` : "訂單成立後須於 24 小時內付款。"}</p>
          </Card>
        </fieldset>
        <Card className="h-fit space-y-4 bg-card/50 p-5">
          <h2 className="text-xl font-bold">訂單摘要</h2>
          <p>{product?.creatorName ?? `創作者賣場 ${product?.creatorId}`}・{product && TYPE_LABEL[product.productType]}</p>
          {selected.map(item => <div key={item.productId} className="flex gap-3 border-b border-border pb-3"><img className="h-14 w-14 rounded object-cover" src={item.image || "/placeholder.svg"} alt={item.name} /><div className="min-w-0 flex-1"><p>{item.name} × {item.quantity}</p><p>{money(item.price * item.quantity)}</p></div></div>)}
          <div className="flex justify-between"><span>商品小計</span><span>{money(subtotal)}</span></div>
          <div className="flex justify-between"><span>運費</span><span>{money(shipping)}</span></div>
          <div className="flex justify-between text-lg font-bold"><span>總計</span><span>{money(subtotal + shipping)}</span></div>
          {product?.productType === "presale" && <p className="text-sm text-violet-400">預售下單後 24 小時內付款；下單前若已達標或截止，將無法送出。</p>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "建立訂單中…" : "建立訂單並前往付款"}</Button>
        </Card>
      </form>}
  </>;
}
