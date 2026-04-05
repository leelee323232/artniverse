"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Sparkles,
  Target,
  Eye,
  Heart,
  Users,
  Palette,
  Rocket,
  ArrowRight,
  CheckCircle2,
  Star,
  Globe,
  Lightbulb,
  HandshakeIcon,
  TrendingUp,
} from "lucide-react"

const values = [
  {
    icon: Heart,
    title: "以創作者為核心",
    description: "我們相信每位創作者都值得被看見，提供完善的支持系統讓創意無限發揮",
  },
  {
    icon: Lightbulb,
    title: "創新驅動",
    description: "持續探索藝術與商業的結合點，創造前所未有的合作模式與產品體驗",
  },
  {
    icon: HandshakeIcon,
    title: "共創共贏",
    description: "建立品牌與創作者之間的信任橋樑，讓合作成為雙方成長的動力",
  },
  {
    icon: Globe,
    title: "永續發展",
    description: "注重產品品質與環境友善，讓藝術創作能夠長久傳承",
  },
]

const stats = [
  { number: "500+", label: "合作創作者" },
  { number: "1,200+", label: "成功專案" },
  { number: "50+", label: "品牌合作夥伴" },
  { number: "98%", label: "客戶滿意度" },
]

const designerBenefits = [
  "專屬產品開發資源與打樣支援",
  "透明的分潤機制與即時收益追蹤",
  "品牌曝光與行銷推廣協助",
  "專業攝影與商品企劃服務",
  "創作者社群與交流活動",
  "優先參與品牌聯名機會",
]

const teamMembers = [
  {
    name: "林宇軒",
    role: "創辦人暨執行長",
    description: "十年品牌設計經驗，致力於連結創作者與商業市場",
  },
  {
    name: "陳思涵",
    role: "創意總監",
    description: "曾任知名設計公司藝術指導，專注於打造獨特視覺體驗",
  },
  {
    name: "王柏翰",
    role: "營運長",
    description: "電商與供應鏈管理專家，確保每件商品的品質與效率",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="absolute left-1/4 top-1/3 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-1/4 top-1/2 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />
        
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 bg-primary/20 text-primary">
              <Sparkles className="mr-1 h-3 w-3" />
              關於 ARTNIVERSE
            </Badge>
            <h1 className="mb-6 text-4xl font-bold text-foreground md:text-6xl">
              讓創作者的
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                想像力
              </span>
              <br />
              成為觸手可及的美好
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              ARTNIVERSE 是一個連結創作者與品牌的創意平台，我們相信藝術不應該只存在於畫布上，
              而是能夠融入每個人的日常生活，創造更美好的體驗
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border/50 bg-card/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mb-2 text-3xl font-bold text-primary md:text-4xl">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground">
                品牌故事
              </h2>
              <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-primary to-secondary" />
            </div>

            <div className="space-y-8 text-lg leading-relaxed text-muted-foreground">
              <p>
                ARTNIVERSE 誕生於一個簡單的信念：每位創作者都應該有機會讓自己的作品被更多人看見、
                被更多人擁有。我們看見了無數才華洋溢的創作者，他們的作品停留在社群媒體的按讚數字裡，
                卻難以轉化為實際的收益與影響力。
              </p>
              <p>
                2021 年，我們開始打造這個平台，希望能夠成為創作者與品牌之間的橋樑。
                不只是單純的授權合作，而是提供從創意發想、產品開發、生產製造到市場銷售的完整支持。
              </p>
              <p>
                如今，ARTNIVERSE 已經與超過 500 位創作者合作，完成了 1,200 多個專案，
                將藝術創作轉化為人們生活中的美好物件。從戶外露營用品到居家生活擺設，
                我們持續探索藝術與生活結合的更多可能。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-card/30 py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="relative overflow-hidden border-border/50 bg-card/50 p-8 backdrop-blur-sm">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
              <div className="relative">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary">
                  <Target className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-foreground">使命</h3>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  打造一個讓創作者能夠專注於創作、讓品牌能夠輕鬆找到合適創作者、
                  讓消費者能夠擁有獨特藝術商品的生態系統。
                  我們致力於降低創作者進入商業市場的門檻，
                  同時確保每一次合作都能創造真正的價值。
                </p>
              </div>
            </Card>

            <Card className="relative overflow-hidden border-border/50 bg-card/50 p-8 backdrop-blur-sm">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-secondary/20 blur-2xl" />
              <div className="relative">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-accent">
                  <Eye className="h-7 w-7 text-secondary-foreground" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-foreground">願景</h3>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  成為亞洲最具影響力的創作者經濟平台，
                  建立一個創作者、品牌與消費者三方共贏的永續生態。
                  我們期望在 2030 年前，能夠幫助 10,000 位創作者實現創作自由，
                  讓藝術真正成為每個人生活的一部分。
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              核心價值
            </h2>
            <p className="text-muted-foreground">
              這些價值觀引導著我們的每一個決策
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <Card
                  key={index}
                  className="group border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/50"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-foreground">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-card/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              核心團隊
            </h2>
            <p className="text-muted-foreground">
              一群熱愛創作、相信創作者力量的夥伴
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className="border-border/50 bg-card/50 p-6 text-center backdrop-blur-sm"
              >
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mb-1 text-lg font-bold text-foreground">
                  {member.name}
                </h3>
                <p className="mb-3 text-sm font-medium text-primary">
                  {member.role}
                </p>
                <p className="text-sm text-muted-foreground">
                  {member.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Join as Designer CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-primary/10 p-8 backdrop-blur-sm md:p-12">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />

            <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <Badge className="mb-4 bg-primary/20 text-primary">
                  <Palette className="mr-1 h-3 w-3" />
                  加入我們
                </Badge>
                <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                  成為
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    產品設計師
                  </span>
                </h2>
                <p className="mb-6 text-lg text-muted-foreground">
                  無論你是插畫家、平面設計師、還是任何類型的視覺創作者，
                  我們都歡迎你加入 ARTNIVERSE 的創作者行列。
                  讓你的作品不只是數位檔案，而是能夠被人們真正擁有的美好物件。
                </p>

                <div className="mb-8 grid gap-3 sm:grid-cols-2">
                  {designerBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/creator-portal">
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-primary to-secondary sm:w-auto"
                    >
                      <Rocket className="mr-2 h-5 w-5" />
                      立即申請加入
                    </Button>
                  </Link>
                  <Link href="/creator-portal">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full bg-transparent sm:w-auto"
                    >
                      了解更多
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <Card className="border-border/50 bg-card/80 p-6 backdrop-blur-sm">
                  <h3 className="mb-4 text-lg font-bold text-foreground">
                    創作者成功案例
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 rounded-lg bg-muted/30 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                        <Star className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">小雨插畫</p>
                        <p className="text-sm text-muted-foreground">
                          「加入 ARTNIVERSE 後，我的作品終於能夠以實體商品的形式被更多人看見，
                          半年內收入成長了 300%！」
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 rounded-lg bg-muted/30 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20">
                        <TrendingUp className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">墨染工作室</p>
                        <p className="text-sm text-muted-foreground">
                          「平台的產品開發團隊非常專業，讓我能夠專注在創作上，
                          不用煩惱生產和物流的問題。」
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="border-t border-border/50 bg-card/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            有任何問題嗎？
          </h2>
          <p className="mb-8 text-muted-foreground">
            無論是合作洽談、創作者申請或任何疑問，我們都很樂意為您服務
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-gradient-to-r from-primary to-secondary">
              聯絡我們
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent">
              查看常見問題
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
