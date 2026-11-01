"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getApiOrder, getPaymentConfig, payApiOrder, refreshApiOrder, checkoutError, uuidPattern, type ApiOrder, type TapPayConfig } from "@/lib/commerce/checkout-api";
import { TapPayCard } from "./tappay-card";
import { TapPayAlternativePayment } from "./tappay-alternative-payment";
import { methodReady, paymentLabels, paymentMethods } from "@/lib/commerce/checkout-api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const money = (value: number) => `NT$ ${value.toLocaleString("zh-TW")}`;
const labels: Record<string, string> = { pending: "待付款或處理中", processing: "付款處理中", authorized: "信用卡已授權", paid: "付款完成", failed: "付款失敗", cancelled: "付款已取消", expired: "付款期限已過", refunded: "已退款", partially_refunded: "部分退款" };

export function ApiPayment({ orderId }: { orderId: string }) {
  const { user, isLoading } = useAuth();
  if (!uuidPattern.test(orderId)) return <p role="alert">訂單編號無效，請返回購物車。</p>;
  if (isLoading) return <p>確認登入中…</p>;
  if (!user) return <div className="space-y-4"><p>請登入原訂單帳號。登入後回到此頁重新整理，即可繼續付款或查詢。</p><a href="/login/" target="_blank" rel="noopener noreferrer" className="underline">另開分頁登入</a></div>;
  return <Payment key={`${user.id}:${orderId}`} orderId={orderId} />;
}

function Payment({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [config, setConfig] = useState<TapPayConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(0);
  const [reload, setReload] = useState(0);
  const locked = useRef(false);
  const alive = useRef(false);
  useEffect(() => {
    alive.current = true;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { alive.current = false; window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setUncertain(true); setError("");
    async function load() {
      // A bank redirect's query parameters never establish payment success.
      const [orderResult, configResult] = await Promise.allSettled([getApiOrder(orderId, controller.signal), getPaymentConfig(controller.signal)]);
      if (controller.signal.aborted) return;
      if (configResult.status === "fulfilled") setConfig(configResult.value);
      else setConfig(null);
      if (orderResult.status === "rejected") throw orderResult.reason;
      let current = orderResult.value;
      setOrder(current);
      if (current.payment) current = await refreshApiOrder(orderId);
      if (controller.signal.aborted) return;
      setOrder(current); setUncertain(false);
      if (configResult.status === "rejected") setError(checkoutError(configResult.reason));
    }
    void load().catch(e => { if (!controller.signal.aborted) setError(checkoutError(e)); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [orderId, reload]);

  async function refresh() {
    if (locked.current || loading) return;
    locked.current = true; setBusy(true); setError(""); setUncertain(true);
    try {
      const current = await refreshApiOrder(orderId);
      if (alive.current) { setOrder(current); setUncertain(false); }
    } catch (e) { if (alive.current) setError(checkoutError(e)); }
    finally { locked.current = false; if (alive.current) setBusy(false); }
  }

  const expired = !!order && (!Number.isFinite(Date.parse(order.expires_at)) || now >= Date.parse(order.expires_at));
  const method = order?.payment_method ?? "card";
  const limits = config?.method_settings?.[method];
  const available = paymentMethods.includes(method) && methodReady(config, method) && order?.environment === "sandbox" && order.currency === "TWD" && (!limits || (order.total >= limits.min_amount && order.total <= limits.max_amount));
  const canPay = !!available && !!order?.can_pay && !expired && !uncertain && !busy && !loading;
  async function pay(prime: string) {
    if (locked.current || !canPay || !order || Date.now() >= Date.parse(order.expires_at)) return;
    locked.current = true; setBusy(true); setUncertain(true); setError("");
    try {
      const current = await payApiOrder(order.id, prime, method);
      if (alive.current) { setOrder(current); setUncertain(false); }
    } catch (e) { if (alive.current) setError(checkoutError(e)); }
    finally { locked.current = false; if (alive.current) setBusy(false); }
  }

  let bankUrl: string | null = null;
  try {
    if ((method === "card" || method === "line_pay") && order?.payment?.payment_url && !order.can_pay && !expired && !["authorized", "paid", "failed", "cancelled", "expired", "refunded", "partially_refunded"].includes(order.payment_status)) {
      const url = new URL(order.payment.payment_url);
      if (url.protocol === "https:" && !url.username && !url.password) bankUrl = url.href;
    }
  } catch { /* Invalid gateway URLs must not be rendered as links. */ }

  const payee = method === "atm" ? order?.payment?.payee_info : null;
  const accountDeadline = Date.parse(order?.payment?.payment_expires_at ?? "");
  const canTransfer = !!payee && !!order?.payment?.can_transfer && Number.isFinite(accountDeadline) && now < accountDeadline && !uncertain && !loading && !busy;
  const statusLabel = order?.payment_status === "pending"
    ? !order.payment ? "待付款" : method === "atm" && payee ? "已取得虛擬帳號，待確認入帳" : method === "line_pay" && bankUrl ? "待完成 LINE Pay 付款" : "付款處理中"
    : order?.payment_status === "authorized" && method !== "card" ? "交易已授權" : labels[order?.payment_status ?? ""] ?? "交易狀態待確認";

  return <div className="mx-auto max-w-2xl space-y-6">
    <h1 className="text-3xl font-bold">訂單付款</h1>
    <p className="rounded-lg bg-amber-500/10 p-3 text-sm">TapPay 官方測試環境，不會實際扣款或出貨。ATM 測試虛擬帳號請勿真實轉帳。</p>
    {loading && <p role="status">取得訂單與付款狀態中…</p>}
    {error && <div role="alert" className="space-y-2 text-destructive"><p>{error}</p><a href="/login/" target="_blank" rel="noopener noreferrer" className="text-sm underline">另開分頁登入（登入後請回此頁重新整理）</a></div>}
    {order && <Card className="space-y-4 p-5">
      <p className="break-all text-sm text-muted-foreground">訂單編號：{order.id}</p>
      <p>付款方式：{paymentLabels[method] ?? "未知付款方式"}</p>
      <p role="status" className="text-lg font-bold">{statusLabel}</p>
      {order.items.map(item => <div key={item.product_id} className="flex justify-between gap-4"><span>{item.name} × {item.quantity}</span><span>{money(item.unit_price * item.quantity)}</span></div>)}
      <div className="flex justify-between"><span>商品小計</span><span>{money(order.subtotal)}</span></div>
      <div className="flex justify-between"><span>運費</span><span>{money(order.shipping)}</span></div>
      <div className="flex justify-between text-xl font-bold"><span>應付金額</span><span>{money(order.total)}</span></div>
      <p>收件人：{order.contact.name}・{order.contact.phone}</p><p>收件地址：{order.contact.address}</p>
      <p className="text-sm">付款截止：{new Date(order.expires_at).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", hour12: false })}（台灣時間）</p>
      {order.payment_status === "authorized" && <p>交易已授權，請勿再次付款。後續請款狀態以後端查詢結果為準。</p>}
      {order.payment_status === "paid" && <p className="text-green-500">後端已確認付款完成。</p>}
      {expired && order.can_pay && <p className="text-destructive">付款期限已過，無法再送出付款。</p>}
      {uncertain && !loading && <p className="text-amber-500">尚未確認交易結果，請先查詢付款狀態，勿重複付款或建立新訂單。</p>}
      {payee && <section className="space-y-2 rounded-md border p-4" aria-label="ATM 繳費資訊">
        <h2 className="font-bold">ATM 測試繳費資訊</h2>
        <p>銀行代碼：<span className="font-mono">{payee.vacc_bank_code}</span></p>
        <p className="break-all">虛擬帳號：<span className="font-mono">{payee.vacc_no}</span></p>
        <p>繳費金額：{money(order.total)}</p>
        <p>繳費期限：{Number.isFinite(accountDeadline) ? new Date(accountDeadline).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", hour12: false }) + "（台灣時間）" : "尚未確認，請查詢付款狀態"}</p>
        {canTransfer ? <p>測試帳號已建立，等待金流確認模擬入帳。請勿向此帳號真實轉帳。</p> : <p>目前不提供轉帳操作。請以查詢結果確認是否已入帳或逾期，勿重複取號。</p>}
      </section>}
      {!order.can_pay && !bankUrl && !payee && !["authorized", "paid", "refunded", "partially_refunded"].includes(order.payment_status) && <p className="text-sm">目前無法再次付款。請查詢付款狀態取得最新結果。</p>}
      {method === "card" && bankUrl && !uncertain && !loading && !busy && <Button asChild><a href={bankUrl}>前往銀行 3D 驗證</a></Button>}
      <Button variant="outline" disabled={loading || busy} onClick={() => void refresh()}>{busy ? "處理中…" : "查詢付款狀態"}</Button>
    </Card>}
    {!loading && order?.can_pay && !available && <p>此付款方式尚未就緒或金額不符合限制。請確認後端設定後重新載入。</p>}
    {canPay && config && order && <Card className="p-5">{method === "card" ? <TapPayCard config={config} total={order.total} disabled={!canPay} onPay={pay} /> : <TapPayAlternativePayment config={config} method={method} total={order.total} disabled={!canPay} onPay={pay} />}</Card>}
    {method === "line_pay" && bankUrl && config?.environment === "sandbox" && order?.environment === "sandbox" && !uncertain && !loading && !busy && <Card className="p-5"><TapPayAlternativePayment config={config} method="line_pay" total={order.total} disabled={false} paymentUrl={bankUrl} onPay={pay} /></Card>}
    <div className="flex gap-3"><Button asChild variant="outline"><Link href="/cart">返回購物車</Link></Button><Button variant="outline" disabled={loading || busy} onClick={() => setReload(n => n + 1)}>重新載入</Button></div>
  </div>;
}
