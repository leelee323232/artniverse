"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { api } from "@/lib/api";
import { useAuth, type User } from "@/lib/auth-context";
import { createApiOrder, draftKey, getPaymentConfig, checkoutError, uuidPattern, type CartApiItem, type CheckoutDraft, type Contact, type TapPayConfig } from "@/lib/commerce/checkout-api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { methodReady, paymentLabels, paymentMethods, type PaymentMethod } from "@/lib/commerce/checkout-api";

export function ApiCheckout({ draftId }: { draftId: string }) {
  const { user, isLoading } = useAuth();
  return isLoading ? <p>確認登入中…</p> : !user ? <div className="space-y-4"><p>請先登入，再回到購物車結帳。</p><Button asChild><Link href="/login">前往登入</Link></Button></div> : <Form key={`${user.id}:${draftId}`} owner={String(user.id)} draftId={draftId} profile={user} />;
}

function Form({ owner, draftId, profile }: { owner: string; draftId: string; profile: User }) {
  const router = useRouter();
  const [draft, setDraft] = useState<CheckoutDraft | null>(null);
  const [config, setConfig] = useState<TapPayConfig | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("card");
  // Prefill once per member/draft; reloads and profile refreshes must not replace edits.
  // A saved submitted request below takes precedence for idempotent order retries.
  const [contact, setContact] = useState<Contact>(() => ({
    name: profile.name ?? "", email: profile.email ?? "",
    phone: (profile.phone ?? "").replace(/[\s()-]/g, ""), address: profile.address ?? "",
  }));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const locked = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    setError(""); setConfig(null); setDraft(null);
    async function load() {
      if (!uuidPattern.test(draftId)) throw new Error("請從資料庫商品購物車前往結帳。");
      const raw = sessionStorage.getItem(draftKey(owner, draftId));
      if (!raw) throw new Error("找不到本次結帳資料，請返回購物車重新選擇。");
      const saved: CheckoutDraft = JSON.parse(raw);
      if (saved.owner !== owner || !Array.isArray(saved.items) || !saved.items.length) throw new Error("結帳資料無效。");
      if (saved.orderId && uuidPattern.test(saved.orderId)) { router.replace(`/checkout/payment?order=${saved.orderId}`); return; }
      const conf = await getPaymentConfig(controller.signal);
      if (controller.signal.aborted) return;
      setDraft(saved); setConfig(conf);
      setMethod(saved.submitted?.payment_method ?? (saved.submitted ? "card" : paymentMethods.find(value => methodReady(conf, value)) ?? "card"));
      if (saved.submitted) setContact(saved.submitted.contact);
    }
    void load().catch(e => { if (!controller.signal.aborted) setError(checkoutError(e)); });
    return () => controller.abort();
  }, [draftId, owner, reload, router]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft || locked.current || !methodReady(config, method)) return;
    locked.current = true; setBusy(true); setError("");
    let pending = draft;
    try {
      if (!pending.submitted) {
        const response = await api.get<{ data: CartApiItem[] }>("/api/v1/cart", { timeout: 15000 });
        const current = response.data.data;
        if (pending.items.some(item => !current.some(row => String(row.id) === String(item.id) && String(row.productId) === String(item.productId) && row.quantity === item.quantity && row.price === item.price && row.isAvailable !== false))) {
          throw new Error("購物車已變更，請返回購物車重新確認。");
        }
        const items = pending.items.map(item => ({ product_id: Number(item.productId), quantity: item.quantity }));
        if (items.some(item => !Number.isSafeInteger(item.product_id) || item.product_id < 1 || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99)) throw new Error("商品 ID 或數量不正確。");
        pending = { ...pending, submitted: { idempotency_key: draftId, payment_method: method, items, contact: {
          name: contact.name.trim(), email: contact.email.trim(), phone: contact.phone.trim(), address: contact.address.trim(),
        } } };
        // Save the exact payload before I/O; a timeout must resend this payload and key.
        sessionStorage.setItem(draftKey(owner, draftId), JSON.stringify(pending));
        setDraft(pending);
      }
      const order = await createApiOrder(pending.submitted!);
      // Routing must still work if browser storage becomes unavailable after server success.
      try { sessionStorage.setItem(draftKey(owner, draftId), JSON.stringify({ ...pending, submitted: undefined, orderId: order.id })); } catch { /* Server owns the order. */ }
      router.replace(`/checkout/payment?order=${encodeURIComponent(order.id)}`);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 422) {
        const editable = { ...pending, submitted: undefined };
        try { sessionStorage.setItem(draftKey(owner, draftId), JSON.stringify(editable)); setDraft(editable); } catch { /* Keep frozen request if storage failed. */ }
      }
      setError(checkoutError(e));
    } finally { locked.current = false; setBusy(false); }
  }

  return <div className="space-y-6">
    <Link href="/cart" className="text-sm underline">返回購物車</Link>
    <h1 className="text-3xl font-bold">結帳</h1>
    <p className="rounded-lg bg-amber-500/10 p-3 text-sm">TapPay 官方測試環境，不會實際扣款或出貨。ATM 測試虛擬帳號請勿真實轉帳。</p>
    {error && <div role="alert" className="space-y-2 text-destructive"><p>{error}</p><Button variant="outline" disabled={busy} onClick={() => setReload(n => n + 1)}>重新載入</Button>{error.includes("登入狀態已失效") && <a href="/login/" target="_blank" rel="noopener noreferrer" className="ml-3 text-sm underline">另開分頁登入，完成後回此頁重新整理</a>}</div>}
    {!draft ? !error && <p>載入結帳資料中…</p> : <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="space-y-4 p-5">
        <h2 className="text-xl font-bold">收件資料</h2>
        <fieldset disabled={busy || !!draft.submitted} className="space-y-4">
          {([['name', '收件人姓名', 'text', 40], ['email', 'Email', 'email', 40], ['phone', '電話（數字，可加國碼 +）', 'tel', 16], ['address', '收件地址', 'text', 200]] as const).map(([key, label, type, maxLength]) => <div className="space-y-2" key={key}><Label htmlFor={`checkout-${key}`}>{label}</Label><Input id={`checkout-${key}`} type={type} required maxLength={maxLength} pattern={key === 'phone' ? '[+]?[0-9]{8,15}' : undefined} value={contact[key]} onChange={e => setContact(previous => ({ ...previous, [key]: e.target.value }))} /></div>)}
        </fieldset>
        <fieldset disabled={busy || !!draft.submitted} className="space-y-3">
          <legend className="mb-2 font-bold">付款方式</legend>
          {paymentMethods.map(value => <label key={value} className="flex items-center gap-2 rounded-md border p-3">
            <input type="radio" name="payment-method" value={value} checked={method === value} disabled={!methodReady(config, value)} onChange={() => setMethod(value)} />
            <span>{paymentLabels[value]}{!methodReady(config, value) && "（尚未開通）"}</span>
          </label>)}
        </fieldset>
        <p className="text-sm">建立訂單後，確認最終金額再付款。訂單建立後無法切換付款方式。</p>
        {method === "atm" && <p className="text-sm text-muted-foreground">ATM 含運費總額須為 NT$ 16～49,999。取得帳號不代表已付款，須等待金流確認入帳。</p>}
        {draft.submitted && <p role="status" className="text-sm text-amber-500">已保存本次送單內容。若連線中斷，請用下方按鈕取得同一筆訂單，勿另開新訂單。</p>}
      </Card>
      <Card className="h-fit space-y-4 p-5">
        <h2 className="text-xl font-bold">訂單摘要</h2>
        {draft.items.map(item => <div className="flex justify-between gap-3" key={item.id}><span>{item.name} × {item.quantity}</span><span>NT$ {(item.price * item.quantity).toLocaleString('zh-TW')}</span></div>)}
        <p>商品預估小計：NT$ {draft.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString('zh-TW')}</p>
        <p className="text-sm text-muted-foreground">運費及最終金額由後端計算，於下一步付款頁確認。</p>
        {config && !methodReady(config, method) && <p role="status">所選付款方式尚未開通或設定未完成，請聯繫管理員。</p>}
        <Button type="submit" className="w-full" disabled={busy || !methodReady(config, method)}>{busy ? '建立訂單中…' : draft.submitted ? '繼續取得原訂單' : '建立訂單並確認付款金額'}</Button>
      </Card>
    </form>}
  </div>;
}
