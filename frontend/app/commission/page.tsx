"use client"

import { Navigation } from "@/components/navigation"
import { UniverseBackground } from "@/components/universe-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, CheckCircle2, Palette, Video, ImageIcon, Flame, Check, Package, Factory, CreditCard } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const subscriptionPlans = [
  {
    id: "starter",
    name: "Starter",
    title: "試水營量",
    subtitle: "想測試創作者合作效果的品牌",
    price: "$12,000",
    period: "/月",
    originalPrice: "季繳$32,400（9折）",
    popular: false,
    creatorCount: "1位/月",
    monthlyDesigns: "2款設計",
    features: [
      { name: "創作者基本媒合（一品牌調性配對提案）", included: true },
      { name: "基礎貼文文案與Hashtag建議", included: true },
      { name: "成效報表（曝光/互動）", included: true },
      { name: "合作溝通", included: false },
      { name: "成效數據分析（曝光/互動）", included: false },
      { name: "合約代管", included: false },
      { name: "創作者管理", included: true },
      { name: "客製創作者媒合（精準受眾）", included: false },
      { name: "基礎專案管理", included: false },
      { name: "內容策略與主題規劃", included: false },
      { name: "專案管理", included: false },
      { name: "品質控管", included: false },
      { name: "品牌素材/腳本協助", included: false },
      { name: "創作者串聯曝光", included: false },
      { name: "內容優化建議", included: false },
      { name: "主題企劃（活動/檔期操作）", included: false },
      { name: "年度內容排程", included: false },
      { name: "跨平台內容策略（IG/Reels/Shorts）", included: false },
      { name: "廣告素材產出（不含媒體費）", included: false },
      { name: "原創IP角色聯名使用權（期間內）", included: false },
      { name: "產品優先排程", included: false },
      { name: "專屬長期內容策略顧問", included: false },
      { name: "專屬團隊支持", included: false },
      { name: "大型活動／快閃活動聯名", included: false },
      { name: "專屬創作者池（固定合作班底）", included: false },
    ],
  },
  {
    id: "growth",
    name: "Growth 成長",
    title: "Growth 成長",
    subtitle: "想穩定經營內容與品牌聲量",
    price: "$25,000",
    period: "/月",
    originalPrice: "半年$127,500（85折）",
    popular: true,
    creatorCount: "3位/月",
    monthlyDesigns: "6款設計",
    features: [
      { name: "創作者基本媒合（一品牌調性配對提案）", included: true },
      { name: "基礎貼文文案與Hashtag建議", included: true },
      { name: "成效報表（曝光/互動）", included: true },
      { name: "合作溝通", included: true },
      { name: "成效數據分析（曝光/互動）", included: true },
      { name: "合約代管", included: true },
      { name: "創作者管理", included: true },
      { name: "客製創作者媒合（精準受眾）", included: true },
      { name: "基礎專案管理", included: true },
      { name: "內容策略與主題規劃", included: true },
      { name: "專案管理", included: true },
      { name: "品質控管", included: true },
      { name: "品牌素材/腳本協助", included: true },
      { name: "創作者串聯曝光", included: true },
      { name: "內容優化建議", included: true },
      { name: "主題企劃（活動/檔期操作）", included: false },
      { name: "年度內容排程", included: false },
      { name: "跨平台內容策略（IG/Reels/Shorts）", included: false },
      { name: "廣告素材產出（不含媒體費）", included: false },
      { name: "原創IP角色聯名使用權（期間內）", included: false },
      { name: "產品優先排程", included: false },
      { name: "專屬長期內容策略顧問", included: false },
      { name: "專屬團隊支持", included: false },
      { name: "大型活動／快閃活動聯名", included: false },
      { name: "專屬創作者池（固定合作班底）", included: false },
    ],
  },
  {
    id: "scale",
    name: "Scale",
    title: "擴散曝光",
    subtitle: "需要快速提升曝光與討論度",
    price: "$55,000",
    period: "/月",
    originalPrice: "年繳$528,000（8折）",
    popular: false,
    creatorCount: "6位/月",
    monthlyDesigns: "12款設計",
    features: [
      { name: "創作者基本媒合（一品牌調性配對提案）", included: true },
      { name: "基礎貼文文案與Hashtag建議", included: true },
      { name: "成效報表（曝光/互動）", included: true },
      { name: "合作溝通", included: true },
      { name: "成效數據分析（曝光/互動）", included: true },
      { name: "合約代管", included: true },
      { name: "創作者管理", included: true },
      { name: "客製創作者媒合（精準受眾）", included: true },
      { name: "基礎專案管理", included: true },
      { name: "內容策略與主題規劃", included: true },
      { name: "專案管理", included: true },
      { name: "品質控管", included: true },
      { name: "品牌素材/腳本協助", included: true },
      { name: "創作者串聯曝光", included: true },
      { name: "內容優化建議", included: true },
      { name: "主題企劃（活動/檔期操作）", included: true },
      { name: "年度內容排程", included: true },
      { name: "跨平台內容策略（IG/Reels/Shorts）", included: true },
      { name: "廣告素材產出（不含媒體費）", included: true },
      { name: "原創IP角色聯名使用權（期間內）", included: true },
      { name: "產品優先排程", included: true },
      { name: "專屬長期內容策略顧問", included: false },
      { name: "專屬團隊支持", included: false },
      { name: "大型活動／快閃活動聯名", included: false },
      { name: "專屬創作者池（固定合作班底）", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    title: "品牌宇宙（客製）",
    subtitle: "重視品牌長期經營與市場影響力",
    price: "客製報價",
    period: "",
    originalPrice: "建議$800,000+/月",
    popular: false,
    creatorCount: "客製化",
    monthlyDesigns: "客製化",
    features: [
      { name: "創作者基本媒合（一品牌調性配對提案）", included: true },
      { name: "基礎貼文文案與Hashtag建議", included: true },
      { name: "成效報表（曝光/互動）", included: true },
      { name: "合作溝通", included: true },
      { name: "成效數據分析（曝光/互動）", included: true },
      { name: "合約代管", included: true },
      { name: "創作者管理", included: true },
      { name: "客製創作者媒合（精準受眾）", included: true },
      { name: "基礎專案管理", included: true },
      { name: "內容策略與主題規劃", included: true },
      { name: "專案管理", included: true },
      { name: "品質控管", included: true },
      { name: "品牌素材/腳本協助", included: true },
      { name: "創作者串聯曝光", included: true },
      { name: "內容優化建議", included: true },
      { name: "主題企劃（活動/檔期操作）", included: true },
      { name: "年度內容排程", included: true },
      { name: "跨平台內容策略（IG/Reels/Shorts）", included: true },
      { name: "廣告素材產出（不含媒體費）", included: true },
      { name: "原創IP角色聯名使用權（期間內）", included: true },
      { name: "產品優先排程", included: true },
      { name: "專屬長期內容策略顧問", included: true },
      { name: "專屬團隊支持", included: true },
      { name: "大型活動／快閃活動聯名", included: true },
      { name: "專屬創作者池（固定合作班底）", included: true },
    ],
  },
]

const singleProjectTypes = [
  {
    id: "brand",
    title: "品牌設計",
    description: "Logo、VI 設計、品牌識別系統",
    icon: Sparkles,
    priceRange: "NT$ 10,000 - 50,000",
    turnaround: "2-4 週",
  },
  {
    id: "illustration",
    title: "插畫繪製",
    description: "商業插畫、角色設計、場景繪製",
    icon: Palette,
    priceRange: "NT$ 5,000 - 30,000",
    turnaround: "1-3 週",
  },
  {
    id: "product",
    title: "周邊商品設計",
    description: "T-shirt、貼紙、包裝等商品設計",
    icon: CheckCircle2,
    priceRange: "NT$ 3,000 - 20,000",
    turnaround: "1-2 週",
  },
  {
    id: "event-visual",
    title: "活動主視覺設計",
    description: "活動海報、展覽視覺、主題設計",
    icon: ImageIcon,
    priceRange: "NT$ 8,000 - 40,000",
    turnaround: "1-3 週",
  },
  {
    id: "video",
    title: "短影音製作",
    description: "Reels、Shorts、TikTok 短影音內容",
    icon: Video,
    priceRange: "NT$ 5,000 - 25,000",
    turnaround: "1-2 週",
  },
]

const processSteps = [
  {
    icon: Package,
    title: "商品開發流程",
    items: [
      "創作者設計圖／視覺完成",
      "品牌提出產品規格（品項／顏色／數量）",
      "我們提供打樣與報價",
    ],
  },
  {
    icon: Factory,
    title: "製造與供應鏈",
    items: [
      "工廠媒合與成本控管",
      "小量試產 → 大量量產",
      "品質控管與交期管理",
    ],
  },
  {
    icon: CreditCard,
    title: "費用與合作方式",
    items: [
      "商品製作費用為額外報價（不含於內容方案）",
      "依產品規格與數量提供專屬報價",
      "訂閱客戶享專屬製造折扣與優先排程",
    ],
  },
]

const steps = [
  {
    number: "01",
    title: "提交需求",
    description: "填寫委託表單，說明你的設計需求與預算",
  },
  {
    number: "02",
    title: "創作者回應",
    description: "系統會媒合適合的創作者，並在 24 小時內回覆",
  },
  {
    number: "03",
    title: "確認細節",
    description: "與創作者討論細節、時程與報價",
  },
  {
    number: "04",
    title: "開始創作",
    description: "創作者開始製作，你可以隨時追蹤進度",
  },
  {
    number: "05",
    title: "交付成果",
    description: "收到成品並確認滿意後完成委託",
  },
]

export default function CommissionPage() {
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null)

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            專業客製化設計服務
          </div>
          <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">委託創作</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            與才華洋溢的創作者合作，打造專屬於你的獨特設計
          </p>
        </div>

        {/* Why Long-term Cooperation Section */}
        <div className="mb-16">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">為什麼要長期合作？</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              創作者內容需要「至少3個月」才能累積演算法權重
              <br />
              短期是運氣，長期才是成長
            </p>
          </div>

          {/* Subscription Plans */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {subscriptionPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative flex flex-col border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all hover:shadow-xl ${
                  plan.popular ? "border-primary ring-2 ring-primary/50" : "hover:border-primary/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      <Flame className="h-3 w-3" />
                      最熱門
                    </span>
                  </div>
                )}
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground">{plan.name}</p>
                  <h3 className="text-lg font-bold text-foreground">{plan.title}</h3>
                </div>
                <p className="mb-4 text-xs text-muted-foreground">{plan.subtitle}</p>
                <div className="mb-4">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-primary">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{plan.originalPrice}</p>
                </div>

                {/* Key Metrics */}
                <div className="mb-4 space-y-2 border-t border-border/50 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">創作者合作數</span>
                    <span className="font-semibold text-foreground">{plan.creatorCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">每月設計交付</span>
                    <span className="font-semibold text-foreground">{plan.monthlyDesigns}</span>
                  </div>
                </div>

                {/* Core Features Preview */}
                <ul className="mb-4 flex-1 space-y-2">
                  {plan.features.filter(f => f.included).slice(0, 5).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feature.name}</span>
                    </li>
                  ))}
                  {plan.features.filter(f => f.included).length > 5 && (
                    <li className="text-sm text-primary">
                      +{plan.features.filter(f => f.included).length - 5} 項更多服務
                    </li>
                  )}
                </ul>

                {/* Expand/Collapse Details */}
                <button
                  onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                  className="mb-4 text-sm text-primary hover:underline"
                >
                  {expandedPlan === plan.id ? "收起詳細比較" : "查看完整方案內容"}
                </button>

                {expandedPlan === plan.id && (
                  <div className="mb-4 max-h-64 space-y-1 overflow-y-auto border-t border-border/50 pt-4">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        {feature.included ? (
                          <Check className="h-3 w-3 flex-shrink-0 text-primary" />
                        ) : (
                          <span className="h-3 w-3 flex-shrink-0 text-center text-muted-foreground/50">—</span>
                        )}
                        <span className={feature.included ? "text-foreground" : "text-muted-foreground/50"}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <Link href={`/commission/subscribe/${plan.id}`} className="mt-auto">
                  <Button
                    className={`w-full ${plan.popular ? "bg-gradient-to-r from-primary to-secondary" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    立即訂閱
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* Single Project Types */}
        <div className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">單次專案</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {singleProjectTypes.map((type) => {
              const Icon = type.icon
              return (
                <Card
                  key={type.id}
                  className="group border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all hover:scale-105 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-foreground">{type.title}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">{type.description}</p>
                  <div className="space-y-2 border-t border-border/50 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">價格範圍</span>
                      <span className="font-bold text-foreground">{type.priceRange}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">完成時間</span>
                      <span className="font-bold text-foreground">{type.turnaround}</span>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Content x Product Section */}
        <div className="mb-16">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">內容 × 商品，一條龍變現</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              完成創作者合作後，可延伸為品牌禮品或銷售商品，由我們協助生產落地
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {processSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <Card
                  key={index}
                  className="border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all hover:border-primary/50"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                  </div>
                  <ul className="space-y-3">
                    {step.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2 text-sm">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Why Choose ARTNIVERSE Section */}
        <div className="mb-16">
          <div className="mx-auto max-w-3xl rounded-lg border border-primary/30 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-10 text-center backdrop-blur-sm">
            <h2 className="mb-3 text-3xl font-bold text-foreground">為什麼選擇 ARTNIVERSE？</h2>
            <p className="text-lg text-muted-foreground">
              省下創作者溝通、合約、管理成本
              <br />
              一次合作，等於一整個內容團隊
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">委託流程</h2>
          <div className="mx-auto max-w-4xl">
            <div className="space-y-6">
              {steps.map((step, index) => (
                <Card key={step.number} className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-lg font-bold text-primary-foreground">
                        {step.number}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-lg font-bold text-foreground">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="ml-6 mt-4 h-8 w-0.5 bg-gradient-to-b from-primary/50 to-transparent" />
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mx-auto max-w-2xl text-center">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 p-12 backdrop-blur-sm">
            <h2 className="mb-4 text-2xl font-bold text-foreground">準備好開始你的專案了嗎？</h2>
            <p className="mb-8 text-muted-foreground">填寫委託表單，讓我們為你找到最適合的創作者</p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/commission/request">
                <Button size="lg" className="bg-gradient-to-r from-primary to-secondary">
                  <Sparkles className="mr-2 h-4 w-4" />
                  免費取得專屬提案
                </Button>
              </Link>
              <Link href="/commission/my-requests">
                <Button size="lg" variant="outline">
                  查看我的委託
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
