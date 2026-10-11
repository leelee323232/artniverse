"use client";

import { useSearchParams } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { UniverseBackground } from "@/components/universe-background";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { mockOrders } from "../page";
import Link from "next/link";
import { ArrowLeft, Clock, Package, Truck, CheckCircle } from "lucide-react";

const getStatusInfo = (status: string) => {
  switch (status) {
    case "pending":
      return {
        label: "待付款",
        icon: Clock,
        color: "text-yellow-400",
      };
    case "processing":
      return {
        label: "未出貨",
        icon: Package,
        color: "text-blue-400",
      };
    case "shipping":
      return {
        label: "已出貨",
        icon: Truck,
        color: "text-purple-400",
      };
    case "delivered":
      return {
        label: "已送達",
        icon: CheckCircle,
        color: "text-green-400",
      };
    default:
      return {
        label: "已完成",
        icon: CheckCircle,
        color: "text-green-400",
      };
  }
};

export default function OrderDetailContent() {
  // 從 URL 取得訂單 ID
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";

  const { user } = useAuth();

  if (!user) {
    return (
      <div className="relative min-h-screen">
        <UniverseBackground />
        <Navigation />
        <div className="container mx-auto flex min-h-screen items-center justify-center px-4 pt-16">
          <Card className="border-border/50 bg-card/30 p-8 backdrop-blur-md text-center">
            <p className="mb-4 text-foreground">請先登入以查看訂單</p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-primary to-secondary">
                前往登入
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const order = mockOrders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="relative min-h-screen">
        <UniverseBackground />
        <Navigation />
        <div className="container mx-auto flex min-h-screen items-center justify-center px-4 pt-16">
          <Card className="border-border/50 bg-card/30 p-8 backdrop-blur-md text-center">
            <p className="mb-4 text-foreground">找不到此訂單</p>
            <Link href="/account/orders">
              <Button variant="outline" className="bg-transparent">
                返回我的訂單
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="mx-auto max-w-2xl space-y-4">
          {/* 返回按鈕 */}
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            我的訂單
          </Link>

          {/* 訂單狀態 */}
          {(() => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;

            return (
              <Card className="border-border/50 bg-card/30 backdrop-blur-md p-6 text-center">
                <StatusIcon
                  className={`mx-auto mb-3 h-12 w-12 ${statusInfo.color}`}
                />
                <p className={`text-3xl font-bold ${statusInfo.color}`}>
                  {statusInfo.label}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  更新時間：{order.statusUpdatedAt}
                </p>
              </Card>
            );
          })()}

          {/* 賣場 + 商品清單 */}
          <Card className="border-border/50 bg-card/30 backdrop-blur-md overflow-hidden">
            <div className="border-b border-border/50 bg-white/5 px-6 py-3">
              <p className="text-sm text-muted-foreground">
                賣場：
                <span className="font-medium text-primary">
                  {order.creator}
                </span>
              </p>
            </div>

            <div className="divide-y divide-border/30">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted/30">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{item.name}</p>
                    {item.spec && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {item.spec}
                      </p>
                    )}
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      x{item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 font-medium text-foreground">
                    NT$ {item.price}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end border-t border-border/50 bg-white/5 px-6 py-3">
              <p className="text-sm text-muted-foreground">
                訂單總金額：
                <span className="ml-2 text-lg font-bold text-primary">
                  NT$ {order.total}
                </span>
              </p>
            </div>
          </Card>

          {/* 訂單資訊 */}
          <Card className="border-border/50 bg-card/30 backdrop-blur-md px-6 py-4 space-y-3">
            <p className="font-semibold text-foreground">訂單資訊</p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">訂單編號</span>
                <span className="font-medium text-foreground">{order.id}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">下單時間</span>
                <span className="text-foreground">{order.date}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">付款方式</span>
                <span className="text-foreground">{order.paymentMethod}</span>
              </div>
            </div>
          </Card>

          {/* 收件資訊 */}
          <Card className="border-border/50 bg-card/30 backdrop-blur-md px-6 py-4 space-y-3">
            <p className="font-semibold text-foreground">收件資訊</p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">收件人</span>
                <span className="text-foreground">{order.receiver}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">電話</span>
                <span className="text-foreground">{order.phone}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="shrink-0 text-muted-foreground">
                  {order.deliveryType === "store" ? "取貨門市" : "配送地址"}
                </span>
                <span className="text-right text-foreground">
                  {order.deliveryType === "store"
                    ? order.storeInfo
                    : order.address}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
