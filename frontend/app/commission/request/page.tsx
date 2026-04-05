"use client"

import type React from "react"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { UniverseBackground } from "@/components/universe-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function CommissionRequestPage() {
  const [attachments, setAttachments] = useState<string[]>([])
  const { toast } = useToast()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files).map((file) => URL.createObjectURL(file))
      setAttachments([...attachments, ...newFiles])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "委託已提交",
      description: "我們會盡快為你媒合適合的創作者",
    })
  }

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      <div className="container mx-auto max-w-4xl px-4 pt-24 pb-20">
        {/* Header */}
        <div className="mb-8">
          <Link href="/commission">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回委託頁面
            </Button>
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-foreground">提交委託需求</h1>
          <p className="text-muted-foreground">詳細說明你的設計需求，我們會為你找到最適合的創作者</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-border/50 bg-card/30 p-8 backdrop-blur-sm">
            <div className="space-y-6">
              {/* Commission Type */}
              <div className="space-y-2">
                <Label htmlFor="type">委託類型 *</Label>
                <Select required>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="選擇委託類型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brand">品牌設計</SelectItem>
                    <SelectItem value="illustration">插畫繪製</SelectItem>
                    <SelectItem value="product">周邊商品設計</SelectItem>
                    <SelectItem value="packaging">包裝設計</SelectItem>
                    <SelectItem value="custom">客製化專案</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Project Title */}
              <div className="space-y-2">
                <Label htmlFor="title">專案標題 *</Label>
                <Input id="title" placeholder="例如：咖啡廳品牌 Logo 設計" required className="bg-background/50" />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">詳細需求說明 *</Label>
                <Textarea
                  id="description"
                  placeholder="請詳細描述你的設計需求，包括：&#10;- 專案背景與目的&#10;- 設計風格偏好&#10;- 目標受眾&#10;- 使用場景&#10;- 其他特殊要求"
                  rows={8}
                  required
                  className="bg-background/50"
                />
              </div>

              {/* Budget Range */}
              <div className="space-y-2">
                <Label htmlFor="budget">預算範圍 *</Label>
                <Select required>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="選擇預算範圍" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3000-5000">NT$ 3,000 - 5,000</SelectItem>
                    <SelectItem value="5000-10000">NT$ 5,000 - 10,000</SelectItem>
                    <SelectItem value="10000-20000">NT$ 10,000 - 20,000</SelectItem>
                    <SelectItem value="20000-50000">NT$ 20,000 - 50,000</SelectItem>
                    <SelectItem value="50000+">NT$ 50,000 以上</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <Label htmlFor="deadline">希望完成日期 *</Label>
                <div className="relative">
                  <Input id="deadline" type="date" required className="bg-background/50" />
                  <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {/* Style Preference */}
              <div className="space-y-2">
                <Label htmlFor="style">風格偏好</Label>
                <Input id="style" placeholder="例如：極簡、可愛、復古、現代..." className="bg-background/50" />
              </div>

              {/* Reference Images */}
              <div className="space-y-3">
                <Label>參考圖片或檔案</Label>
                <div className="grid grid-cols-4 gap-4">
                  {attachments.map((file, index) => (
                    <div key={index} className="group relative aspect-square overflow-hidden rounded-lg bg-muted/30">
                      <img
                        src={file || "/placeholder.svg"}
                        alt={`Attachment ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="absolute right-2 top-2 rounded-full bg-destructive p-1 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-4 w-4 text-destructive-foreground" />
                      </button>
                    </div>
                  ))}
                  {attachments.length < 8 && (
                    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/50 bg-muted/20 transition-colors hover:border-primary/50 hover:bg-muted/30">
                      <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">上傳檔案</span>
                      <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                    </label>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">上傳參考圖片、靈感來源或相關資料（最多 8 個檔案）</p>
              </div>

              {/* Contact Info */}
              <div className="space-y-4 rounded-lg border border-border/50 bg-background/30 p-6">
                <h3 className="font-bold text-foreground">聯絡資訊</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">姓名 *</Label>
                    <Input id="name" required className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" required className="bg-background/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">電話</Label>
                  <Input id="phone" type="tel" className="bg-background/50" />
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">其他備註</Label>
                <Textarea
                  id="notes"
                  placeholder="任何其他想讓創作者知道的資訊..."
                  rows={4}
                  className="bg-background/50"
                />
              </div>

              {/* Terms */}
              <div className="rounded-lg border border-border/50 bg-background/30 p-4">
                <label className="flex items-start gap-3">
                  <input type="checkbox" required className="mt-1 rounded" />
                  <span className="text-sm text-muted-foreground">
                    我已閱讀並同意
                    <Link href="/terms" className="text-primary hover:underline">
                      服務條款
                    </Link>
                    與
                    <Link href="/privacy" className="text-primary hover:underline">
                      隱私政策
                    </Link>
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 border-t border-border/50 pt-6">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-primary to-secondary">
                  提交委託需求
                </Button>
                <Link href="/commission" className="flex-1">
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
