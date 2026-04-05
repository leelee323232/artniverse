"use client"

import { Navigation } from "@/components/navigation"
import { UniverseBackground } from "@/components/universe-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  CreditCard,
  Calendar,
  Download,
} from "lucide-react"
import Link from "next/link"

const walletStats = {
  availableBalance: 45680,
  pendingBalance: 8920,
  totalEarnings: 128450,
  thisMonthEarnings: 12340,
}

const transactions = [
  {
    id: "TXN-001",
    type: "income",
    category: "product_sale",
    description: "星空筆記本 × 2",
    amount: 760,
    date: "2024-01-15",
    status: "completed",
    orderId: "ORD-001",
  },
  {
    id: "TXN-002",
    type: "income",
    category: "commission",
    description: "品牌吉祥物設計",
    amount: 18000,
    date: "2024-01-14",
    status: "completed",
    orderId: "COM-001",
  },
  {
    id: "TXN-003",
    type: "withdrawal",
    category: "payout",
    description: "提領至銀行帳戶",
    amount: -25000,
    date: "2024-01-13",
    status: "completed",
    payoutId: "PAY-001",
  },
  {
    id: "TXN-004",
    type: "income",
    category: "product_sale",
    description: "療癒小熊貼紙組 × 1",
    amount: 120,
    date: "2024-01-12",
    status: "completed",
    orderId: "ORD-002",
  },
  {
    id: "TXN-005",
    type: "income",
    category: "product_sale",
    description: "夢境明信片套組 × 3",
    amount: 750,
    date: "2024-01-11",
    status: "pending",
    orderId: "ORD-003",
  },
]

const earningsBreakdown = [
  { category: "商品銷售", amount: 32450, percentage: 65, color: "bg-primary" },
  { category: "委託設計", amount: 12340, percentage: 25, color: "bg-secondary" },
  { category: "其他收入", amount: 4980, percentage: 10, color: "bg-accent" },
]

export default function WalletPage() {
  const getTransactionIcon = (type: string) => {
    return type === "income" ? (
      <ArrowDownRight className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowUpRight className="h-4 w-4 text-red-500" />
    )
  }

  const getStatusColor = (status: string) => {
    return status === "completed" ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"
  }

  const getStatusText = (status: string) => {
    return status === "completed" ? "已完成" : "處理中"
  }

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">錢包</h1>
            <p className="text-muted-foreground">管理你的收益與提領</p>
          </div>
          <Link href="/creator-portal/wallet/withdraw">
            <Button className="bg-gradient-to-r from-primary to-secondary">
              <Wallet className="mr-2 h-4 w-4" />
              申請提領
            </Button>
          </Link>
        </div>

        {/* Balance Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">可提領餘額</p>
                <p className="text-2xl font-bold text-foreground">
                  NT$ {walletStats.availableBalance.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-green-500/20 p-3">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">待入帳金額</p>
                <p className="text-2xl font-bold text-foreground">NT$ {walletStats.pendingBalance.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-yellow-500/20 p-3">
                <Calendar className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </Card>

          <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">本月收益</p>
                <p className="text-2xl font-bold text-foreground">
                  NT$ {walletStats.thisMonthEarnings.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-primary/20 p-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">累計收益</p>
                <p className="text-2xl font-bold text-foreground">NT$ {walletStats.totalEarnings.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-secondary/20 p-3">
                <Wallet className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Transactions */}
          <div>
            <Tabs defaultValue="all" className="w-full">
              <div className="mb-6 flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="all">全部交易</TabsTrigger>
                  <TabsTrigger value="income">收入</TabsTrigger>
                  <TabsTrigger value="withdrawal">提領</TabsTrigger>
                </TabsList>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  匯出報表
                </Button>
              </div>

              <TabsContent value="all" className="space-y-3">
                {transactions.map((transaction) => (
                  <Card key={transaction.id} className="border-border/50 bg-card/30 p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-muted/30 p-2">{getTransactionIcon(transaction.type)}</div>
                        <div>
                          <p className="font-bold text-foreground">{transaction.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{transaction.date}</span>
                            <span>•</span>
                            <Badge className={getStatusColor(transaction.status)} variant="secondary">
                              {getStatusText(transaction.status)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg font-bold ${transaction.amount > 0 ? "text-green-500" : "text-red-500"}`}
                        >
                          {transaction.amount > 0 ? "+" : ""}NT$ {Math.abs(transaction.amount).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="income" className="space-y-3">
                {transactions
                  .filter((t) => t.type === "income")
                  .map((transaction) => (
                    <Card key={transaction.id} className="border-border/50 bg-card/30 p-4 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="rounded-full bg-muted/30 p-2">{getTransactionIcon(transaction.type)}</div>
                          <div>
                            <p className="font-bold text-foreground">{transaction.description}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{transaction.date}</span>
                              <span>•</span>
                              <Badge className={getStatusColor(transaction.status)} variant="secondary">
                                {getStatusText(transaction.status)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-500">+NT$ {transaction.amount.toLocaleString()}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
              </TabsContent>

              <TabsContent value="withdrawal" className="space-y-3">
                {transactions
                  .filter((t) => t.type === "withdrawal")
                  .map((transaction) => (
                    <Card key={transaction.id} className="border-border/50 bg-card/30 p-4 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="rounded-full bg-muted/30 p-2">{getTransactionIcon(transaction.type)}</div>
                          <div>
                            <p className="font-bold text-foreground">{transaction.description}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{transaction.date}</span>
                              <span>•</span>
                              <Badge className={getStatusColor(transaction.status)} variant="secondary">
                                {getStatusText(transaction.status)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-500">
                            NT$ {Math.abs(transaction.amount).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Earnings Breakdown */}
            <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
              <h3 className="mb-4 font-bold text-foreground">本月收益來源</h3>
              <div className="space-y-4">
                {earningsBreakdown.map((item) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.category}</span>
                      <span className="font-bold text-foreground">NT$ {item.amount.toLocaleString()}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted/30">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Payment Methods */}
            <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-foreground">付款方式</h3>
                <Link href="/creator-portal/wallet/payment-methods">
                  <Button variant="outline" size="sm">
                    管理
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/30 p-3">
                  <div className="rounded-full bg-primary/20 p-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">台新銀行</p>
                    <p className="text-xs text-muted-foreground">帳號末四碼 1234</p>
                  </div>
                  <Badge variant="secondary">預設</Badge>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
              <h3 className="mb-4 font-bold text-foreground">快速操作</h3>
              <div className="space-y-2">
                <Link href="/creator-portal/wallet/withdraw">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Wallet className="mr-2 h-4 w-4" />
                    申請提領
                  </Button>
                </Link>
                <Link href="/creator-portal/wallet/payment-methods">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <CreditCard className="mr-2 h-4 w-4" />
                    管理付款方式
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  下載收益報表
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
