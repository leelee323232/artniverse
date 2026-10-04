"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { readOrders, payOrder, paymentStatus, type CheckoutOrder } from "@/lib/commerce/orders";
import { useCart } from "@/lib/commerce/cart-context";
import { TYPE_LABEL } from "@/lib/commerce/cart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const money = (value: number) => `NT$ ${value.toLocaleString("zh-TW")}`;
const labels = { pending: "待付款", failed: "付款失敗", paid: "付款成功", expired: "付款逾期" };
export default function PaymentPage() { return <Suspense fallback={<p>訂單載入中…</p>}><Payment /></Suspense>; }
function Payment() {
  const id = useSearchParams().get("order");
  const router = useRouter();
  const { now } = useCart();
  const [orders, setOrders] = useState<CheckoutOrder[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  useEffect(() => {
    if (!id) { router.replace("/account/orders"); return; }
    function load() {
      try { setOrders(readOrders()); setError(""); }
      catch { setError("無法讀取訂單資料，請確認瀏覽器儲存設定。"); }
      setLoaded(true);
    }
    load(); window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, [id, router]);
  const order = orders.find(item => item.id === id);
  const status = order ? paymentStatus(order, now || Date.now()) : null;
  function pay(success: boolean) {
    if (!order || locked.current) return;
    locked.current = true; setBusy(true); setError("");
    try {
      const updated = payOrder(order.id, success, Date.now());
      setOrders(items => items.map(item => item.id === updated.id ? updated : item));
    } catch (e) { setError(e instanceof Error ? e.message : "付款狀態儲存失敗，請稍後重試。"); }
    finally { locked.current = false; setBusy(false); }
  }
  if (!loaded) return <p>訂單載入中…</p>;
  if (!order) return <>
    <h1 className="mb-5 text-3xl font-bold">無法開啟付款頁</h1>
    <p role="alert" className="mb-4 text-destructive">{error || "找不到此訂單，請確認訂單連結或返回購物車。"}</p>
    <Button asChild variant="outline"><Link href="/cart">返回購物車</Link></Button>
  </>;
  const canPay = status === "pending" || status === "failed";
  return <div className="mx-auto max-w-2xl space-y-6">
    <h1 className="text-3xl font-bold">{status === "pending" ? "訂單成立，請完成付款" : labels[status!]}</h1>
    <p className="text-sm text-muted-foreground">前端示範流程，不會實際扣款或出貨。</p>
    <Card className="space-y-4 bg-card/50 p-5">
      <p className="break-all text-sm text-muted-foreground">訂單編號：{order.id}</p>
      <p className="font-bold">{order.creatorName}・{TYPE_LABEL[order.productType]}</p>
      {order.items.map(item => <div key={item.productId} className="flex justify-between gap-4"><span>{item.name} × {item.quantity}</span><span>{money(item.price * item.quantity)}</span></div>)}
      <div className="flex justify-between"><span>運費</span><span>{money(order.shipping)}</span></div>
      <div className="flex justify-between text-xl font-bold"><span>應付金額</span><span>{money(order.total)}</span></div>
      <p>收件人：{order.contact.name}・{order.contact.phone}</p>
      <p>宅配地址：{order.contact.address}</p>
      <p>付款方式：{order.contact.paymentMethod === "card" ? "信用卡" : "ATM 轉帳"}</p>
      {status !== "paid" && <p className="text-amber-500">付款截止：{new Date(order.paymentDeadline).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", hour12: false })}（台灣時間）</p>}
      {status === "paid" && <p role="status" className="text-green-500">已完成示範付款，訂單狀態已保存。</p>}
      {status === "failed" && <p role="alert" className="text-destructive">示範付款失敗，可在原期限內重試；不會重建訂單。</p>}
      {status === "expired" && <p role="alert" className="text-destructive">付款期限已過，此訂單已無法付款。</p>}
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {canPay && <div className="flex flex-wrap gap-3"><Button disabled={busy} onClick={() => pay(true)}>{status === "failed" ? "重新模擬付款成功" : "模擬付款成功"}</Button><Button variant="outline" disabled={busy} onClick={() => pay(false)}>模擬付款失敗</Button></div>}
    </Card>
    <div className="flex flex-wrap gap-3"><Button asChild><Link href="/cart">返回購物車</Link></Button></div>
  </div>;
}
