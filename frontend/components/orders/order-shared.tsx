"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { UniverseBackground } from "@/components/universe-background";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { orderMoney, orderStatus, type OrderSummary } from "@/lib/commerce/my-orders-api";

export function OrdersLayout({ children }: { children: ReactNode }) {
  return <div className="relative min-h-screen"><UniverseBackground /><Navigation />
    <main className="container mx-auto px-4 pb-20 pt-24"><div className="mx-auto max-w-4xl space-y-6">{children}</div></main>
  </div>;
}
export function OrdersLogin() {
  return <Card className="space-y-4 p-8 text-center"><p>請先登入以查看自己的訂單。</p><Button asChild><Link href="/login">前往登入</Link></Button></Card>;
}
export function OrderError({ message }: { message: string }) {
  return <div role="alert" className="space-y-2 rounded-lg border border-destructive/40 p-4 text-destructive"><p>{message}</p>
    {message.includes("登入") && <a href="/login/" target="_blank" rel="noopener noreferrer" className="text-sm underline">另開分頁登入，完成後回此頁重新載入</a>}
  </div>;
}
export function OrderBadge({ order }: { order: OrderSummary }) {
  const color = order.payment_status === "paid" ? "bg-green-500/15 text-green-500" : ["failed", "cancelled", "expired"].includes(order.payment_status) ? "bg-red-500/15 text-red-500" : "bg-amber-500/15 text-amber-500";
  return <Badge className={color}>{orderStatus(order)}</Badge>;
}
export function OrderItems({ order }: { order: OrderSummary }) {
  return <div className="divide-y divide-border/50">{order.items.map((item, index) => <div key={`${item.product_id}:${index}`} className="flex items-center justify-between gap-4 py-4">
    <div className="min-w-0"><p className="break-words font-medium">{item.name}</p><p className="text-sm text-muted-foreground">數量 {item.quantity}・單價 {orderMoney(item.unit_price, order.currency)}</p><p className="text-xs text-muted-foreground">創作者編號：{item.creator_id}</p></div>
    <span className="shrink-0">{orderMoney(item.unit_price * item.quantity, order.currency)}</span>
  </div>)}</div>;
}
