"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OrdersLayout, OrdersLogin, OrderError, OrderBadge, OrderItems } from "@/components/orders/order-shared";
import { getMyOrder, refreshMyOrder, methodLabels, orderDate, orderMoney, orderError, orderUuid, retryDelay, type OrderDetail } from "@/lib/commerce/my-orders-api";

export default function OrderDetailContent() {
  const id = useSearchParams().get("id") ?? "";
  const { user, isLoading } = useAuth();
  return <OrdersLayout><Link href="/account/orders" className="text-sm underline">返回我的訂單</Link><h1 className="text-3xl font-bold">訂單明細</h1>
    {isLoading ? <p role="status">確認登入中…</p> : !user ? <OrdersLogin /> : !orderUuid.test(id) ? <p role="alert">訂單編號無效，請從我的訂單列表開啟。示範訂單不屬於真實訂單。</p> : <Detail key={`${user.id}:${id}`} id={id} />}
  </OrdersLayout>;
}

function Detail({ id }: { id: string }) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uncertain, setUncertain] = useState(false);
  const [reload, setReload] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [now, setNow] = useState(0);
  const request = useRef<AbortController | null>(null);
  const locked = useRef(false);
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => { setNow(Date.now()); setCooldown(n => Math.max(0, n - 1)); }, 1000);
    return () => { window.clearInterval(timer); request.current?.abort(); };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setOrder(null); setError("");
    void getMyOrder(id, controller.signal).then(data => {
      if (!controller.signal.aborted) setOrder(data);
    }).catch(e => {
      if (!controller.signal.aborted) { setError(orderError(e, true)); setCooldown(retryDelay(e)); }
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, reload]);
  async function refresh() {
    if (locked.current || loading || cooldown > 0) return;
    locked.current = true; setBusy(true); setError(""); setUncertain(true);
    const controller = new AbortController();
    request.current = controller;
    try {
      const data = await refreshMyOrder(id, controller.signal);
      if (!controller.signal.aborted) { setOrder(data); setUncertain(false); setCooldown(5); }
    } catch (e) {
      if (!controller.signal.aborted) { setError(orderError(e, true)); setCooldown(retryDelay(e)); }
    } finally { locked.current = false; if (!controller.signal.aborted) setBusy(false); }
  }
  const deadline = Date.parse(order?.expires_at ?? "");
  const expired = !Number.isFinite(deadline) || now >= deadline;
  const payee = order?.payment_method === "atm" ? order.payment?.payee_info : null;
  const disabled = loading || busy || cooldown > 0;
  return <div className="space-y-5">
    {loading && <p role="status">載入訂單明細中…</p>}
    {error && <OrderError message={error} />}
    {order && <>
      {order.environment === "sandbox" && <p className="rounded-lg bg-amber-500/10 p-3 text-sm">TapPay 測試訂單，不會實際扣款或出貨。ATM 測試帳號請勿真實轉帳。</p>}
      <Card className="space-y-3 bg-card/50 p-5"><OrderBadge order={order} /><p className="break-all">訂單編號：{order.id}</p><p>下單時間：{orderDate(order.created_at)}</p><p>訂單更新：{orderDate(order.updated_at)}</p><p>付款方式：{methodLabels[order.payment_method] ?? "其他付款方式"}</p><p className="text-sm text-muted-foreground">時間均為台灣時間。畫面顯示後端已保存的狀態，可按下方按鈕向金流查詢。</p>
        {order.payment_status === "authorized" && <p>交易已授權，請勿重複付款；已授權與已請款分開顯示。</p>}
        {order.payment_status === "paid" && <p className="text-green-500">後端已確認付款完成。</p>}
        {uncertain && <p role="status" className="text-amber-500">尚未確認最新付款結果，請先查詢付款狀態，勿重複付款。</p>}
        <div className="flex flex-wrap gap-3"><Button variant="outline" disabled={disabled} onClick={() => void refresh()}>{busy ? "查詢中…" : cooldown > 0 ? `${cooldown} 秒後可再查詢` : "查詢付款狀態"}</Button>
          {!uncertain && !loading && !busy && <Button asChild variant="outline"><Link href={`/checkout/payment?source=api&order=${encodeURIComponent(order.id)}`}>{order.can_pay && !expired ? "前往付款" : "開啟付款紀錄"}</Link></Button>}
        </div>
      </Card>
      <Card className="bg-card/50 p-5"><h2 className="text-lg font-bold">訂購商品</h2><OrderItems order={order} /><div className="space-y-2 border-t pt-4"><p className="flex justify-between"><span>商品小計</span><span>{orderMoney(order.subtotal, order.currency)}</span></p><p className="flex justify-between"><span>運費</span><span>{orderMoney(order.shipping, order.currency)}</span></p><p className="flex justify-between text-xl font-bold"><span>訂單總額</span><span>{orderMoney(order.total, order.currency)}</span></p></div></Card>
      <Card className="space-y-3 bg-card/50 p-5"><h2 className="text-lg font-bold">收件資料</h2><p>收件人：{order.contact.name}</p><p>電話：{order.contact.phone}</p><p className="break-all">Email：{order.contact.email}</p><p className="break-words">地址：{order.contact.address}</p><p className="text-sm text-muted-foreground">目前尚未提供物流進度與追蹤單號。</p></Card>
      <Card className="space-y-3 bg-card/50 p-5"><h2 className="text-lg font-bold">付款資訊</h2><p>付款截止：{orderDate(order.expires_at)}</p>
        {expired && !["paid", "authorized", "refunded", "partially_refunded"].includes(order.payment_status) && <p>付款期限已過；若已付款，請查詢確認是否入帳，勿重新付款。</p>}
        {order.payment?.rec_trade_id && <p className="break-all">交易識別碼：{order.payment.rec_trade_id}</p>}
        {payee && <div className="space-y-2 rounded-md border p-4"><h3 className="font-semibold">ATM 繳費資訊</h3><p>銀行代碼：<span className="font-mono">{payee.vacc_bank_code}</span></p><p className="break-all">虛擬帳號：<span className="font-mono">{payee.vacc_no}</span></p><p>繳費金額：{orderMoney(order.total, order.currency)}</p><p>繳費期限：{orderDate(order.payment?.payment_expires_at)}</p><p className="text-sm">取得帳號不代表已付款，入帳結果以後端查詢為準。</p></div>}
      </Card>
    </>}
    <Button variant="outline" disabled={disabled} onClick={() => setReload(n => n + 1)}>{cooldown > 0 ? `${cooldown} 秒後可重試` : "重新載入訂單"}</Button>
  </div>;
}
