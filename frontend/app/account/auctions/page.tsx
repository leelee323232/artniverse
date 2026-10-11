"use client"

import { useState } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { UniverseBackground } from "@/components/universe-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { ChevronDown, ChevronUp, Gavel } from "lucide-react"

// ─── 型別 ────────────────────────────────────────────────────────────────────

export type AuctionStatus =
  | "bidding"          // 競標中
  | "pending_payment"  // 待付款（得標）
  | "pending_payment_backup" // 待付款（遞補）
  | "paid"             // 已付款
  | "lost"             // 未得標
  | "withdrawn"        // 已撤回

export interface BidRecord {
  amount: number   // 出價金額
  time: string     // 出價時間 ISO 8601
}

export interface AuctionItem {
  id: string
  productId: string          // 競標商品頁路徑 id
  productName: string
  productImage: string
  myHighestBid: number       // 我的最高有效出價
  currentHighestBid: number  // 目前最高出價（全場）
  status: AuctionStatus
  endTime: string            // 結標時間 ISO 8601
  paymentDeadline?: string   // 付款截止時間（待付款才有）
  finalPrice?: number        // 成交金額（待付款 / 已付款才有）
  orderId?: string           // 訂單編號（已付款才有）
  bidHistory: BidRecord[]    // 自己的出價紀錄
}

// ─── 假資料 ──────────────────────────────────────────────────────────────────

const mockAuctions: AuctionItem[] = [
  {
    id: "a1",
    productId: "2",
    productName: "宇宙圖騰抱枕",
    productImage: "/dreamy-postcards.jpg",
    myHighestBid: 2200,
    currentHighestBid: 2400,
    status: "bidding",
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    bidHistory: [
      { amount: 2200, time: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
      { amount: 1800, time: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
    ],
  },
  {
    id: "a2",
    productId: "5",
    productName: "銀河系香氛掛飾",
    productImage: "/cute-bear-stickers.jpg",
    myHighestBid: 650,
    currentHighestBid: 650,
    status: "pending_payment",
    endTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    paymentDeadline: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
    finalPrice: 650,
    bidHistory: [
      { amount: 650, time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
    ],
  },
  {
    id: "a3",
    productId: "8",
    productName: "宇宙食器組",
    productImage: "/children-book-illustration.jpg",
    myHighestBid: 7000,
    currentHighestBid: 8500,
    status: "lost",
    endTime: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    bidHistory: [
      { amount: 7000, time: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
      { amount: 5500, time: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
    ],
  },
  {
    id: "a4",
    productId: "11",
    productName: "星際探險帳篷",
    productImage: "/dreamy-postcards.jpg",
    myHighestBid: 9000,
    currentHighestBid: 12000,
    status: "paid",
    endTime: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    finalPrice: 9000,
    orderId: "ORD-2024-099",
    bidHistory: [
      { amount: 9000, time: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString() },
    ],
  },
]

export default function AuctionsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("bidding")

  // 未登入
  if (!user) {
    return (
      <div className="relative min-h-screen">
        <UniverseBackground />
        <Navigation />
        <div className="container mx-auto flex min-h-screen items-center justify-center px-4 pt-16">
          <Card className="border-border/50 bg-card/30 p-8 backdrop-blur-md text-center">
            <Gavel className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-4 text-foreground">請先登入以查看競標紀錄</p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-primary to-secondary">前往登入</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  const biddingItems = mockAuctions.filter((a) => a.status === "bidding")
  const pendingItems = mockAuctions.filter((a) =>
    a.status === "pending_payment" || a.status === "pending_payment_backup"
  )

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-3xl font-bold text-foreground">我的競標</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-3">
              <TabsTrigger value="bidding">
                競標中
                {biddingItems.length > 0 && (
                  <Badge className="ml-2 bg-primary/20 text-primary text-xs">
                    {biddingItems.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="pending_payment">
                待付款
                {pendingItems.length > 0 && (
                  <Badge className="ml-2 bg-yellow-500/20 text-yellow-500 text-xs">
                    {pendingItems.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="all">全部紀錄</TabsTrigger>
            </TabsList>

            <TabsContent value="bidding" className="space-y-4">
              {biddingItems.length === 0 ? (
                <EmptyState message="目前沒有競標中的商品" />
              ) : (
                biddingItems.map((item) => <AuctionCard key={item.id} item={item} />)
              )}
            </TabsContent>

            <TabsContent value="pending_payment" className="space-y-4">
              {pendingItems.length === 0 ? (
                <EmptyState message="目前沒有待付款的競標" />
              ) : (
                pendingItems.map((item) => <AuctionCard key={item.id} item={item} />)
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {mockAuctions.length === 0 ? (
                <EmptyState message="尚無競標紀錄" showShopLink />
              ) : (
                mockAuctions.map((item) => <AuctionCard key={item.id} item={item} />)
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

// ─── 空狀態 ──────────────────────────────────────────────────────────────────

function EmptyState({ message, showShopLink }: { message: string; showShopLink?: boolean }) {
  return (
    <Card className="border-border/50 bg-card/30 p-12 backdrop-blur-md text-center">
      <Gavel className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
      <p className="mb-4 text-muted-foreground">{message}</p>
      {showShopLink && (
        <Link href="/shop">
          <Button className="bg-gradient-to-r from-primary to-secondary">前往商店</Button>
        </Link>
      )}
    </Card>
  )
}

// ─── 操作按鈕 ─────────────────────────────────────────────────────────────────

function AuctionActions({ item }: { item: AuctionItem }) {
  const [withdrawn, setWithdrawn] = useState(false)

  if (item.status === "bidding") {
    return (
      <div className="flex items-center gap-2 border-t border-border/50 px-5 py-3">
        <Link href={`/shop/${item.productId}`}>
          <Button size="sm" variant="outline" className="bg-transparent">
            查看商品
          </Button>
        </Link>
        {!withdrawn ? (
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              if (window.confirm("確定要撤回對此商品的全部出價嗎？")) setWithdrawn(true)
            }}
          >
            撤回出價
          </Button>
        ) : (
          <span className="text-sm text-muted-foreground">已撤回</span>
        )}
      </div>
    )
  }

  if (item.status === "pending_payment" || item.status === "pending_payment_backup") {
    const isBackup = item.status === "pending_payment_backup"
    return (
      <div className="border-t border-border/50">
        <div className="mx-5 my-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-4 py-3 text-sm space-y-1">
          <p className="font-medium text-yellow-400">
            {isBackup ? "遞補通知" : "恭喜得標"}
          </p>
          <p className="text-muted-foreground">
            {isBackup
              ? "原得標者逾期未付款，您已遞補為得標者，請在 24 小時內完成付款，以自己的最高有效出價成交。"
              : "請在 24 小時內完成付款，以您的最高有效出價成交。逾期將依序遞補給下一位出價者。"}
          </p>
          <p className="text-yellow-400 font-medium">
            成交金額：NT$ {item.finalPrice?.toLocaleString()}　付款截止：{item.paymentDeadline ? formatDateTime(item.paymentDeadline) : "—"}
          </p>
        </div>
        <div className="flex items-center gap-2 px-5 pb-3">
          <Link href="/cart">
            <Button size="sm" className="bg-gradient-to-r from-primary to-secondary">
              前往購物車結帳
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (item.status === "paid" && item.orderId) {
    return (
      <div className="flex items-center gap-2 border-t border-border/50 px-5 py-3">
        <Link href="/account/orders">
          <Button size="sm" variant="outline" className="bg-transparent">
            查看訂單
          </Button>
        </Link>
      </div>
    )
  }

  return null
}

// ─── 工具函式 ─────────────────────────────────────────────────────────────────

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("zh-TW", {
    month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  })
}

const STATUS_CONFIG: Record<AuctionStatus, { label: string; className: string }> = {
  bidding:                { label: "競標中",   className: "bg-blue-500/20 text-blue-400" },
  pending_payment:        { label: "待付款",   className: "bg-yellow-500/20 text-yellow-400" },
  pending_payment_backup: { label: "遞補待付", className: "bg-orange-500/20 text-orange-400" },
  paid:                   { label: "已付款",   className: "bg-green-500/20 text-green-400" },
  lost:                   { label: "未得標",   className: "bg-muted text-muted-foreground" },
  withdrawn:              { label: "已撤回",   className: "bg-muted text-muted-foreground" },
}

// ─── 競標卡片 ─────────────────────────────────────────────────────────────────

function AuctionCard({ item }: { item: AuctionItem }) {
  const [expanded, setExpanded] = useState(false)
  const statusCfg = STATUS_CONFIG[item.status]

  return (
    <Card className="border-border/50 bg-card/30 backdrop-blur-md overflow-hidden">
      {/* 主要內容 */}
      <Link href={`/shop/${item.productId}`} className="flex gap-4 p-5 hover:bg-white/5 transition-colors">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted/30">
          <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover" />
        </div>

        <div className="flex flex-1 flex-col justify-between min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-foreground truncate">{item.productName}</p>
            <Badge className={`shrink-0 ${statusCfg.className}`}>{statusCfg.label}</Badge>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <div>
              <p className="text-muted-foreground">我的最高出價</p>
              <p className="font-semibold text-foreground">NT$ {item.myHighestBid.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">目前最高出價</p>
              <p className={`font-semibold ${item.currentHighestBid > item.myHighestBid ? "text-destructive" : "text-green-400"}`}>
                NT$ {item.currentHighestBid.toLocaleString()}
              </p>
            </div>
            {item.finalPrice && (
              <div>
                <p className="text-muted-foreground">成交金額</p>
                <p className="font-semibold text-primary">NT$ {item.finalPrice.toLocaleString()}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">
                {item.status === "bidding" ? "結標時間" : "結標於"}
              </p>
              <p className="text-foreground">{formatDateTime(item.endTime)}</p>
            </div>
          </div>

          {item.paymentDeadline && (
            <p className="mt-1 text-xs text-yellow-400">
              付款截止：{formatDateTime(item.paymentDeadline)}
            </p>
          )}
        </div>
      </Link>

      {/* 操作按鈕 */}
      <AuctionActions item={item} />

      {/* 出價紀錄展開 */}
      <div className="border-t border-border/50">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>出價紀錄（{item.bidHistory.length} 筆）</span>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {expanded && (
          <div className="space-y-1 px-5 pb-4">
            {item.bidHistory.map((bid, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{formatDateTime(bid.time)}</span>
                <span className="font-medium text-foreground">NT$ {bid.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
