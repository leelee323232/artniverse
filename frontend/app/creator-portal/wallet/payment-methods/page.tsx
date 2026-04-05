"use client"

import type React from "react"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { UniverseBackground } from "@/components/universe-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CreditCard, Plus, Trash2, Check } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

const paymentMethods = [
  {
    id: "1",
    type: "bank",
    bankName: "台新銀行",
    accountNumber: "1234",
    accountName: "小夢創作室",
    isDefault: true,
  },
  {
    id: "2",
    type: "bank",
    bankName: "國泰世華銀行",
    accountNumber: "5678",
    accountName: "小夢創作室",
    isDefault: false,
  },
]

export default function PaymentMethodsPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const { toast } = useToast()

  const handleSetDefault = (id: string) => {
    toast({
      title: "已設為預設",
      description: "此付款方式已設為預設提領帳戶",
    })
  }

  const handleDelete = (id: string) => {
    toast({
      title: "已刪除",
      description: "付款方式已成功刪除",
    })
  }

  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "新增成功",
      description: "銀行帳戶已成功新增",
    })
    setShowAddForm(false)
  }

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      <div className="container mx-auto max-w-4xl px-4 pt-24 pb-20">
        {/* Header */}
        <div className="mb-8">
          <Link href="/creator-portal/wallet">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回錢包
            </Button>
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-foreground">付款方式管理</h1>
          <p className="text-muted-foreground">管理你的銀行帳戶與提領方式</p>
        </div>

        {/* Payment Methods List */}
        <div className="mb-6 space-y-4">
          {paymentMethods.map((method) => (
            <Card key={method.id} className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/20 p-3">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <p className="font-bold text-foreground">{method.bankName}</p>
                      {method.isDefault && <Badge variant="secondary">預設</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">帳號末四碼 {method.accountNumber}</p>
                    <p className="text-sm text-muted-foreground">戶名：{method.accountName}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!method.isDefault && (
                    <Button variant="outline" size="sm" onClick={() => handleSetDefault(method.id)}>
                      <Check className="mr-1 h-4 w-4" />
                      設為預設
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive bg-transparent"
                    onClick={() => handleDelete(method.id)}
                    disabled={method.isDefault}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Add Payment Method Button */}
        {!showAddForm && (
          <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新增銀行帳戶
          </Button>
        )}

        {/* Add Payment Method Form */}
        {showAddForm && (
          <form onSubmit={handleAddPaymentMethod}>
            <Card className="border-border/50 bg-card/30 p-8 backdrop-blur-sm">
              <h2 className="mb-6 text-xl font-bold text-foreground">新增銀行帳戶</h2>
              <div className="space-y-6">
                {/* Bank Name */}
                <div className="space-y-2">
                  <Label htmlFor="bank-name">銀行名稱 *</Label>
                  <Input id="bank-name" placeholder="例如：台新銀行" required className="bg-background/50" />
                </div>

                {/* Branch */}
                <div className="space-y-2">
                  <Label htmlFor="branch">分行名稱</Label>
                  <Input id="branch" placeholder="例如：台北分行" className="bg-background/50" />
                </div>

                {/* Account Number */}
                <div className="space-y-2">
                  <Label htmlFor="account-number">銀行帳號 *</Label>
                  <Input
                    id="account-number"
                    placeholder="請輸入完整帳號"
                    required
                    className="bg-background/50"
                    maxLength={20}
                  />
                </div>

                {/* Account Name */}
                <div className="space-y-2">
                  <Label htmlFor="account-name">戶名 *</Label>
                  <Input id="account-name" placeholder="請輸入戶名" required className="bg-background/50" />
                  <p className="text-xs text-muted-foreground">戶名必須與註冊資料相符</p>
                </div>

                {/* Bank Code */}
                <div className="space-y-2">
                  <Label htmlFor="bank-code">銀行代碼 *</Label>
                  <Input id="bank-code" placeholder="例如：812" required className="bg-background/50" maxLength={3} />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 border-t border-border/50 pt-6">
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-primary to-secondary">
                    新增帳戶
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setShowAddForm(false)}
                  >
                    取消
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        )}
      </div>
    </div>
  )
}
