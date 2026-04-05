"use client"

import { Navigation } from "@/components/navigation"
import { UniverseBackground } from "@/components/universe-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Sparkles, Check, ArrowLeft, Building2, Mail, Phone, FileText } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

const planDetails: Record<string, {
  name: string
  title: string
  price: string
  period: string
  features: string[]
}> = {
  starter: {
    name: "Starter",
    title: "試水營量",
    price: "$12,000",
    period: "/月",
    features: [
      "1位創作者媒合與管理",
      "每月2則圖文/短影音等內容",
      "基礎貼文文案與Hashtag建議",
      "簡易成效報表（曝光/互動）",
      "合作溝通與合約代管",
    ],
  },
  growth: {
    name: "Growth 成長",
    title: "Growth 成長",
    price: "$25,000",
    period: "/月",
    features: [
      "3位創作者專組合（含中型KOL）",
      "每月4則內容（影音/圖文）",
      "內容策略與主題規劃",
      "每月一次內容優化建議",
      "成效分析報告（含優化方向）",
      "品牌素材/腳本協助",
    ],
  },
  scale: {
    name: "Scale",
    title: "擴散曝光",
    price: "$55,000",
    period: "/月",
    features: [
      "6位以上創作者聯合曝光",
      "每月8-12則內容產出",
      "年度內容搭題與主題企劃",
      "跨平台內容策略（IG/Reels/Shorts）",
      "廣告素材產出（不含媒體費）",
      "原創IP角色聯名使用權（期間內）",
    ],
  },
  enterprise: {
    name: "Enterprise",
    title: "品牌宇宙（客製）",
    price: "客製報價",
    period: "",
    features: [
      "專屬創作者池（固定合作班底）",
      "品牌長期內容策略與顧問",
      "IP角色開發與商品化設計",
      "大型活動/快閃店創作者整合",
      "持年度成長KPI規劃與追蹤",
      "專屬專案經理與曝光排程",
    ],
  },
}

export default function SubscribePage() {
  const params = useParams()
  const planId = params.planId as string
  const plan = planDetails[planId] || planDetails.starter

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        {/* Back Button */}
        <Link
          href="/commission"
          className="mb-8 inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          返回委託創作
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-border/50 bg-card/30 p-6 backdrop-blur-sm">
              <h2 className="mb-4 text-xl font-bold text-foreground">訂閱方案</h2>
              <div className="mb-4 rounded-lg bg-primary/10 p-4">
                <p className="text-sm text-muted-foreground">{plan.name}</p>
                <h3 className="text-lg font-bold text-foreground">{plan.title}</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-2xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">方案內容</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="border-border/50 bg-card/30 p-8 backdrop-blur-sm">
              <h1 className="mb-6 text-2xl font-bold text-foreground">公司基本資料</h1>

              <form className="space-y-6">
                {/* Company Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-lg font-medium text-foreground">
                    <Building2 className="h-5 w-5 text-primary" />
                    公司資訊
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">公司名稱 *</Label>
                      <Input
                        id="companyName"
                        placeholder="請輸入公司名稱"
                        className="border-border/50 bg-background/50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxId">統一編號 *</Label>
                      <Input
                        id="taxId"
                        placeholder="請輸入統一編號"
                        className="border-border/50 bg-background/50"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyAddress">公司地址 *</Label>
                    <Input
                      id="companyAddress"
                      placeholder="請輸入公司地址"
                      className="border-border/50 bg-background/50"
                      required
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-lg font-medium text-foreground">
                    <Mail className="h-5 w-5 text-primary" />
                    聯絡人資訊
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">聯絡人姓名 *</Label>
                      <Input
                        id="contactName"
                        placeholder="請輸入聯絡人姓名"
                        className="border-border/50 bg-background/50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactTitle">職稱</Label>
                      <Input
                        id="contactTitle"
                        placeholder="請輸入職稱"
                        className="border-border/50 bg-background/50"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="請輸入 Email"
                        className="border-border/50 bg-background/50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">聯絡電話 *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="請輸入聯絡電話"
                        className="border-border/50 bg-background/50"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Project Requirements */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-lg font-medium text-foreground">
                    <FileText className="h-5 w-5 text-primary" />
                    委託事項
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brandIntro">品牌/產品簡介 *</Label>
                    <Textarea
                      id="brandIntro"
                      placeholder="請簡述您的品牌或產品..."
                      className="min-h-24 border-border/50 bg-background/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">目標受眾</Label>
                    <Input
                      id="targetAudience"
                      placeholder="例如：25-35歲女性、科技愛好者等"
                      className="border-border/50 bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goals">合作目標 *</Label>
                    <Textarea
                      id="goals"
                      placeholder="請描述您希望透過此次合作達成的目標..."
                      className="min-h-24 border-border/50 bg-background/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferredStyle">偏好的創作者風格</Label>
                    <Input
                      id="preferredStyle"
                      placeholder="例如：療癒、可愛、極簡、美式等"
                      className="border-border/50 bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="additionalNotes">其他備註</Label>
                    <Textarea
                      id="additionalNotes"
                      placeholder="任何其他您想讓我們知道的事項..."
                      className="min-h-24 border-border/50 bg-background/50"
                    />
                  </div>
                </div>

                {/* Payment Notice */}
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <p className="text-sm text-muted-foreground">
                    送出後，我們的專人會在 1-2 個工作天內透過 Email 與您聯繫，確認合作細節並提供正式報價單。
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  送出訂閱申請
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
