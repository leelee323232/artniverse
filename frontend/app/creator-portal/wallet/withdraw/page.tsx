"use client"

import type React from "react"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { UniverseBackground } from "@/components/universe-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, AlertCircle, CreditCard } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function WithdrawPage() {
  const [amount, setAmount] = useState("")
  const { toast } = useToast()

  const availableBalance = 45680
  const minWithdrawal = 1000

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const withdrawAmount = Number.parseInt(amount)

    if (withdrawAmount < minWithdrawal) {
      toast({
        title: "提領金額不足",
        description: `最低提領金額為 NT$ ${minWithdrawal}`,
        variant: "destructive",
      })
      return
    }

    if (withdrawAmount > availableBalance) {
      toast({
        title: "餘額不足",
        description: "提領金額超過可用餘額",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "提領申請已提交",
      description: "預計 3-5 個工作天入帳",
    })
  }

  const setQuickAmount = (value: number) => {
    setAmount(value.toString())
  }

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      <div className="container mx-auto max-w-2xl px-4 pt-24 pb-20">
        {/* Header */}
        <div className="mb-8">
          <Link href="/creator-portal/wallet">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回錢包
            </Button>
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-foreground">申請提領</h1>
          <p className="text-muted-foreground">將收益提領至你的銀行帳戶</p>
        </div>

        {/* Available Balance */}
        <Card className="mb-6 border-border/50 bg-card/30 p-6 backdrop-blur-sm">
          <div className="text-center">
            <p className="mb-2 text-sm text-muted-foreground">可提領餘額</p>
            <p className="text-4xl font-bold text-foreground">NT$ {availableBalance.toLocaleString()}</p>
          </div>
        </Card>

        <form onSubmit={handleSubmit}>
          <Card className="border-border/50 bg-card/30 p-8 backdrop-blur-sm">
            <div className="space-y-6">
              {/* Withdrawal Amount */}
              <div className="space-y-3">
                <Label htmlFor="amount">提領金額 *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="輸入提領金額"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={minWithdrawal}
                  max={availableBalance}
                  required
                  className="bg-background/50 text-lg"
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setQuickAmount(5000)}>
                    NT$ 5,000
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setQuickAmount(10000)}>
                    NT$ 10,000
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setQuickAmount(20000)}>
                    NT$ 20,000
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setQuickAmount(availableBalance)}>
                    全部提領
                  </Button>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <Label htmlFor="payment-method">提領至 *</Label>
                <Select required>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="選擇銀行帳戶" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>台新銀行 - 末四碼 1234</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Link href="/creator-portal/wallet/payment-methods">
                  <Button type="button" variant="link" className="h-auto p-0 text-sm">
                    新增銀行帳戶
                  </Button>
                </Link>
              </div>

              {/* Info Box */}
              <div className="flex gap-3 rounded-lg border border-border/50 bg-background/30 p-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-primary" />
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>提領須知：</p>
                  <ul className="list-inside list-disc space-y-1">
                    <li>最低提領金額為 NT$ {minWithdrawal.toLocaleString()}</li>
                    <li>提領申請後 3-5 個工作天入帳</li>
                    <li>每月可免費提領 3 次，超過次數每次收取 NT$ 15 手續費</li>
                    <li>提領金額將扣除相關稅費</li>
                  </ul>
                </div>
              </div>

              {/* Summary */}
              {amount && Number.parseInt(amount) >= minWithdrawal && (
                <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/10 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">提領金額</span>
                    <span className="font-bold text-foreground">NT$ {Number.parseInt(amount).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">手續費</span>
                    <span className="font-bold text-foreground">NT$ 0</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/50 pt-3">
                    <span className="font-bold text-foreground">實際入帳金額</span>
                    <span className="text-xl font-bold text-primary">
                      NT$ {Number.parseInt(amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 border-t border-border/50 pt-6">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-primary to-secondary">
                  確認提領
                </Button>
                <Link href="/creator-portal/wallet" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    取消
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </div>
  )
}
