import { Navigation } from "@/components/navigation";
import { UniverseBackground } from "@/components/universe-background";
import { PlanetCard } from "@/components/planet-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Rocket, Users, TrendingUp } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/footer";

const creators = [
  {
    id: "1",
    name: "夢幻星球",
    creator: "小夢創作室",
    description: "專注於療癒系插畫與周邊商品設計，帶給你溫暖的視覺體驗",
    tags: ["療癒", "可愛", "插畫"],
    followers: 12500,
    rating: 4.9,
    image: "/placeholder.svg?height=300&width=300",
    color: "#a78bfa",
  },
  {
    id: "2",
    name: "極簡宇宙",
    creator: "Minimal Studio",
    description: "簡約而不簡單，用最少的元素傳達最深的意境",
    tags: ["極簡", "現代", "設計"],
    followers: 8900,
    rating: 4.8,
    image: "/placeholder.svg?height=300&width=300",
    color: "#60a5fa",
  },
  {
    id: "3",
    name: "自然之心",
    creator: "綠野工作室",
    description: "從大自然汲取靈感，創造與環境共生的藝術作品",
    tags: ["自然", "環保", "手作"],
    followers: 15200,
    rating: 5.0,
    image: "/placeholder.svg?height=300&width=300",
    color: "#34d399",
  },
  {
    id: "4",
    name: "賽博星域",
    creator: "Cyber Arts",
    description: "結合科技與藝術，探索未來主義的視覺可能",
    tags: ["科技", "未來", "實驗"],
    followers: 10800,
    rating: 4.7,
    image: "/placeholder.svg?height=300&width=300",
    color: "#f472b6",
  },
  {
    id: "5",
    name: "復古星球",
    creator: "Retro Wave",
    description: "重溫經典美學，用復古風格訴說當代故事",
    tags: ["復古", "美式", "潮流"],
    followers: 9600,
    rating: 4.8,
    image: "/placeholder.svg?height=300&width=300",
    color: "#fb923c",
  },
  {
    id: "6",
    name: "夢境實驗室",
    creator: "Dream Lab",
    description: "超現實主義的視覺探索，打破想像的邊界",
    tags: ["夢幻", "超現實", "藝術"],
    followers: 11400,
    rating: 4.9,
    image: "/placeholder.svg?height=300&width=300",
    color: "#c084fc",
  },
];

const categories = [
  "全部",
  "療癒",
  "極簡",
  "自然",
  "科技",
  "復古",
  "夢幻",
  "實驗",
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-32 pb-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            探索無限創意宇宙
          </div>
          <h1 className="mb-6 text-balance text-5xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
            歡迎來到
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {" "}
              藝術宇宙
            </span>
          </h1>
          <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl">
            每個創作者都是一顆獨特的星球，等待你來探索他們的藝術世界
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border/50 bg-card/30 p-6 text-center backdrop-blur-sm">
            <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">500+</div>
            <div className="text-sm text-muted-foreground">活躍創作者</div>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/30 p-6 text-center backdrop-blur-sm">
            <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20">
              <Rocket className="h-6 w-6 text-secondary" />
            </div>
            <div className="text-3xl font-bold text-foreground">10,000+</div>
            <div className="text-sm text-muted-foreground">原創作品</div>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/30 p-6 text-center backdrop-blur-sm">
            <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <div className="text-3xl font-bold text-foreground">50,000+</div>
            <div className="text-sm text-muted-foreground">滿意顧客</div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {/* <section className="container mx-auto px-4 pb-12">
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={category === "全部" ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105"
            >
              {category}
            </Badge>
          ))}
        </div>
      </section> */}

      {/* Creators Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold text-foreground">
            熱門創作者星球
          </h2>
          <p className="text-muted-foreground">
            點擊星球，進入創作者的專屬宇宙
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator) => (
            <PlanetCard key={creator.id} {...creator} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 pb-32">
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 p-12 text-center backdrop-blur-sm">
          <div className="relative z-10">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              準備好展示你的創作了嗎？
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              加入我們，在藝術宇宙中建立屬於你的星球
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/creator-apply">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary"
                >
                  申請成為創作者
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline">
                  了解更多
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        </div>
      </section>
      <Footer />
    </div>
  );
}
