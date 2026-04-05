"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { UniverseBackground } from "@/components/universe-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { Package, Truck, CheckCircle, Clock, ChevronRight, MessageCircle } from "lucide-react"
import Link from "next/link"

const mockOrders = [
  {
    id: "ORD-2024-001",
    date: "2024-01-15",
    status: "delivered",
    total: 1280,
    items: [
      { name: "星空筆記本", quantity: 2, price: 380, image: "/cute-notebook-with-stars.jpg" },
      { name: "療癒小熊貼紙組", quantity: 1, price: 120, image: "/cute-bear-stickers.jpg" },
      { name: "夢境明信片套組", quantity: 1, price: 400, image: "/dreamy-postcards.jpg" },
    ],
    creator: "星空畫室",
    trackingNumber: "7D1234567890",
  },
  {
    id: "ORD-2024-002",
    date: "2024-01-18",
    status: "shipping",
    total: 850,
    items: [
      { name: "宇宙帆布袋", quantity: 1, price: 450, image: "/universe-tote-bag.jpg" },
      { name: "星球徽章組", quantity: 2, price: 200, image: "/planet-badges.jpg" },
    ],
    creator: "月光工作室",
    trackingNumber: "7D0987654321",
  },
  {
    id: "ORD-2024-003",
    date: "2024-01-20",
    status: "processing",
    total: 560,
    items: [{ name: "手繪風格海報", quantity: 1, price: 560, image: "/hand-drawn-illustration-poster.jpg" }],
    creator: "森林畫家",
    trackingNumber: null,
  },
  {
    id: "ORD-2024-004",
    date: "2024-01-22",
    status: "pending",
    total: 320,
    items: [{ name: "可愛吉祥物設計", quantity: 1, price: 320, image: "/cute-mascot-design.jpg" }],
    creator: "夢想插畫",
    trackingNumber: null,
  },
]

export default function OrdersPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("all")

  if (!user) {
    return (
      <div className="relative min-h-screen">
        <UniverseBackground />
        <Navigation />
        <div className="container mx-auto flex min-h-screen items-center justify-center px-4 pt-16">
          <Card className="border-border/50 bg-card/30 p-8 backdrop-blur-md text-center">
            <p className="mb-4 text-foreground">請先登入以查看訂單</p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-primary to-secondary">前往登入</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "待付款", color: "bg-yellow-500/20 text-yellow-500", icon: Clock }
      case "processing":
        return { label: "處理中", color: "bg-blue-500/20 text-blue-500", icon: Package }
      case "shipping":
        return { label: "運送中", color: "bg-purple-500/20 text-purple-500", icon: Truck }
      case "delivered":
        return { label: "已送達", color: "bg-green-500/20 text-green-500", icon: CheckCircle }
      default:
        return { label: status, color: "bg-muted", icon: Package }
    }
  }

  const filteredOrders =
    activeTab === "all" ? mockOrders : mockOrders.filter((order) => order.status === activeTab)

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-3xl font-bold text-foreground">我的訂單</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-5">
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="pending">待付款</TabsTrigger>
              <TabsTrigger value="processing">處理中</TabsTrigger>
              <TabsTrigger value="shipping">運送中</TabsTrigger>
              <TabsTrigger value="delivered">已送達</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredOrders.length === 0 ? (
                <Card className="border-border/50 bg-card/30 p-12 backdrop-blur-md text-center">
                  <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">目前沒有符合的訂單</p>
                </Card>
              ) : (
                filteredOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status)
                  const StatusIcon = statusInfo.icon

                  return (
                    <Card key={order.id} className="border-border/50 bg-card/30 backdrop-blur-md overflow-hidden">
                      {/* Order Header */}
                      <div className="flex items-center justify-between border-b border-border/50 bg-white/5 px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium text-foreground">{order.id}</p>
                            <p className="text-sm text-muted-foreground">{order.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="p-6">
                        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                          <span>來自</span>
                          <span className="font-medium text-primary">{order.creator}</span>
                        </div>

                        <div className="space-y-4">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                              <div className="h-16 w-16 overflow-hidden rounded-lg bg-muted/30">
                                <img
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{item.name}</p>
                                <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                              </div>
                              <p className="font-medium text-foreground">NT$ {item.price}</p>
                            </div>
                          ))}
                        </div>

                        {/* Tracking */}
                        {order.trackingNumber && (
                          <div className="mt-4 rounded-lg bg-white/5 p-3">
                            <p className="text-sm text-muted-foreground">
                              物流單號：
                              <span className="font-medium text-foreground">{order.trackingNumber}</span>
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Order Footer */}
                      <div className="flex items-center justify-between border-t border-border/50 px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Button variant="outline" size="sm" className="bg-transparent">
                            <MessageCircle className="mr-2 h-4 w-4" />
                            聯繫賣家
                          </Button>
                          {order.status === "delivered" && (
                            <Button variant="outline" size="sm" className="bg-transparent">
                              評價商品
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">訂單金額</p>
                            <p className="text-xl font-bold text-primary">NT$ {order.total}</p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                })
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
