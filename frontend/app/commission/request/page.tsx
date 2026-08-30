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
import { Upload, X, ArrowLeft, Calendar, Search, FileText } from "lucide-react"
import type { ApplicantCondition } from "@/types/commission-request"
import { mockCreators } from "@/mocks/admin/creators"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function CommissionRequestPage() {
  const [attachments, setAttachments] = useState<string[]>([])
  const [applicantCondition, setApplicantCondition] = useState<ApplicantCondition>("all")
  const [targetCreator, setTargetCreator] = useState("")
  const [revenueShare, setRevenueShare] = useState(10)
  const [revenueShareError, setRevenueShareError] = useState("")
  const [proposalFiles, setProposalFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [proposalFileError, setProposalFileError] = useState("")

  const ALLOWED_TYPES = [".pdf", ".doc", ".docx", ".ppt", ".pptx"]
  const MAX_FILE_SIZE_MB = 20

  const addProposalFiles = (incoming: File[]) => {
    const invalid = incoming.filter((f) => {
      const ext = "." + f.name.split(".").pop()?.toLowerCase()
      return !ALLOWED_TYPES.includes(ext)
    })
    const oversized = incoming.filter((f) => f.size > MAX_FILE_SIZE_MB * 1024 * 1024)

    if (invalid.length > 0) {
      setProposalFileError(`不支援的檔案格式：${invalid.map((f) => f.name).join("、")}`)
      return
    }
    if (oversized.length > 0) {
      setProposalFileError(`檔案超過 ${MAX_FILE_SIZE_MB}MB 限制：${oversized.map((f) => f.name).join("、")}`)
      return
    }
    setProposalFileError("")
    setProposalFiles((prev) => [...prev, ...incoming])
  }
  const { toast } = useToast()

  const creatorSuggestions = targetCreator.trim()
    ? mockCreators.filter((c) => c.isActive && c.name.includes(targetCreator.trim()))
    : []

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

              {/* Applicant Condition */}
              <div className="space-y-2">
                <Label htmlFor="applicantCondition">接案人條件 *</Label>
                <Select
                  value={applicantCondition}
                  onValueChange={(v) => setApplicantCondition(v as ApplicantCondition)}
                  required
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部人皆可參與</SelectItem>
                    <SelectItem value="level-above">指定等級以上的人可參與</SelectItem>
                    <SelectItem value="direct">直接指明合作</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Revenue Share */}
              <div className="space-y-2">
                <Label htmlFor="revenueShare">分潤%數 *</Label>
                <div className="relative">
                  <Input
                    id="revenueShare"
                    type="number"
                    min={0}
                    max={100}
                    value={revenueShare}
                    onChange={(e) => {
                      setRevenueShare(Number(e.target.value))
                      setRevenueShareError("")
                    }}
                    onBlur={() => {
                      if (revenueShare < 0) {
                        setRevenueShare(0)
                        setRevenueShareError("分潤%數不可為負數，已自動修正為 0%")
                      } else if (revenueShare > 100) {
                        setRevenueShare(100)
                        setRevenueShareError("分潤%數不可超過 100%，已自動修正為 100%")
                      }
                    }}
                    className={`bg-background/50 pr-10 ${revenueShareError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    required
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                </div>
                {revenueShareError
                  ? <p className="text-xs text-destructive">{revenueShareError}</p>
                  : <p className="text-xs text-muted-foreground">預設為 10%，不可設定負數</p>
                }
              </div>

              {applicantCondition === "direct" && (
                <div className="space-y-2">
                  <Label htmlFor="targetCreator">創作者 *</Label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="targetCreator"
                      value={targetCreator}
                      onChange={(e) => setTargetCreator(e.target.value)}
                      placeholder="輸入創作者名稱搜尋..."
                      required
                      className="bg-background/50 pl-9"
                    />
                    {creatorSuggestions.length > 0 && (
                      <ul className="absolute z-10 mt-1 w-full rounded-lg border border-border/50 bg-background shadow-lg overflow-hidden">
                        {creatorSuggestions.map((creator) => (
                          <li
                            key={creator.id}
                            onClick={() => setTargetCreator(creator.name)}
                            className="cursor-pointer px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            <span className="font-medium">{creator.name}</span>
                            <span className="ml-2 text-xs text-muted-foreground">{creator.specialty}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">輸入創作者名稱，從下拉選單選取</p>
                </div>
              )}

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

              {/* Proposal Files */}
              <div className="space-y-3">
                <Label>上傳企畫書</Label>
                <label
                  className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
                    isDragging
                      ? "border-primary bg-primary/10"
                      : "border-border/50 bg-muted/20 hover:border-primary/50 hover:bg-muted/30"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    addProposalFiles(Array.from(e.dataTransfer.files))
                  }}
                >
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">拖放檔案至此，或點擊上傳</span>
                  <span className="text-xs text-muted-foreground">支援 PDF、Word、PPT，單檔限 {MAX_FILE_SIZE_MB}MB</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      addProposalFiles(Array.from(e.target.files ?? []))
                      e.target.value = ""
                    }}
                  />
                </label>
                {proposalFileError && (
                  <p className="text-xs text-destructive">{proposalFileError}</p>
                )}
                {proposalFiles.length > 0 && (
                  <ul className="space-y-2">
                    {proposalFiles.map((file, index) => (
                      <li key={index} className="flex items-center justify-between rounded-lg border border-border/50 bg-background/30 px-4 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 shrink-0 text-primary" />
                          <span className="truncate text-sm text-foreground">{file.name}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setProposalFiles((prev) => prev.filter((_, i) => i !== index))}
                          className="ml-3 shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
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
