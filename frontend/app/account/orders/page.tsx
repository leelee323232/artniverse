"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OrdersLayout, OrdersLogin, OrderError, OrderBadge, OrderItems } from "@/components/orders/order-shared";
import { listMyOrders, methodLabels, statusLabels, orderDate, orderMoney, orderError, retryDelay, type OrderPage } from "@/lib/commerce/my-orders-api";

export default function OrdersPage() {
  const { user, isLoading } = useAuth();
  return <OrdersLayout><h1 className="text-3xl font-bold">我的訂單</h1>
    {isLoading ? <p role="status">確認登入中…</p> : !user ? <OrdersLogin /> : <OrderList key={String(user.id)} />}
  </OrdersLayout>;
}

function OrderList() {
  const [method, setMethod] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [result, setResult] = useState<OrderPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown(n => Math.max(0, n - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setResult(null); setError("");
    void listMyOrders(page, method, status, controller.signal).then(data => {
      if (!controller.signal.aborted) setResult(data);
    }).catch(e => {
      if (!controller.signal.aborted) { setError(orderError(e)); setCooldown(retryDelay(e)); }
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, method, status, reload]);
  const disabled = loading || cooldown > 0;
  return <div className="space-y-5">
    <Card className="bg-card/50 p-4 sm:p-5">
      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <label className="min-w-0 space-y-2"><span className="block text-sm">付款狀態</span><select className="h-11 w-full rounded-md border bg-background px-3 text-sm" value={status} disabled={disabled} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">全部狀態</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="min-w-0 space-y-2"><span className="block text-sm">付款方式</span><select className="h-11 w-full rounded-md border bg-background px-3 text-sm" value={method} disabled={disabled} onChange={e => { setMethod(e.target.value); setPage(1); }}><option value="">全部方式</option>{Object.entries(methodLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <Button className="h-11 w-full sm:w-auto" variant="outline" disabled={disabled} onClick={() => setReload(n => n + 1)}>{cooldown > 0 ? `${cooldown} 秒後可重試` : "重新載入"}</Button>
      </div>
    </Card>
    <p className="text-sm text-muted-foreground">付款與出貨狀態分開記錄，目前尚未提供物流進度。訂單時間均為台灣時間。</p>
    {error && <OrderError message={error} />}
    {loading && <p role="status">載入訂單中…</p>}
    {!loading && result && result.data.length === 0 && <Card className="space-y-4 p-8 text-center"><p>目前沒有符合條件的訂單。</p>{page > 1 ? <Button variant="outline" onClick={() => setPage(1)}>返回第一頁</Button> : <Button asChild variant="outline"><Link href="/shop">瀏覽商品</Link></Button>}</Card>}
    {!loading && result?.data.map(order => <Card key={order.id} className="overflow-hidden border-border/50 bg-card/50">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5"><div className="min-w-0"><p className="break-all text-sm font-medium">訂單 {order.id}</p><p className="mt-1 text-sm text-muted-foreground">{orderDate(order.created_at)}</p></div><OrderBadge order={order} /></div>
      <div className="px-5"><OrderItems order={order} /></div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t p-5"><div><p className="text-sm text-muted-foreground">{methodLabels[order.payment_method] ?? "其他付款方式"}{order.environment === "sandbox" ? "・測試訂單" : ""}</p><p className="text-xl font-bold">{orderMoney(order.total, order.currency)}</p></div><Button asChild><Link href={`/account/orders/detail?id=${encodeURIComponent(order.id)}`}>查看訂單</Link></Button></div>
    </Card>)}
    {!loading && result && <nav aria-label="訂單分頁" className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">共 {result.meta.total} 筆・第 {result.meta.current_page} / {result.meta.last_page} 頁</p><div className="flex gap-2"><Button variant="outline" disabled={disabled || page <= 1} onClick={() => setPage(n => n - 1)}>上一頁</Button><Button variant="outline" disabled={disabled || !result.meta.has_more_pages} onClick={() => setPage(n => n + 1)}>下一頁</Button></div></nav>}
  </div>;
}
