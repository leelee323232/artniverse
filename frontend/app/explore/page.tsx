"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { UniverseBackground } from "@/components/universe-background"
import { PlanetCard } from "@/components/planet-card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal } from "lucide-react"

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
  {
    id: "7",
    name: "水彩星雲",
    creator: "Aqua Studio",
    description: "用水彩的流動性捕捉宇宙的神秘與美麗",
    tags: ["水彩", "藝術", "手繪"],
    followers: 7800,
    rating: 4.9,
    image: "/placeholder.svg?height=300&width=300",
    color: "#38bdf8",
  },
  {
    id: "8",
    name: "幾何星系",
    creator: "Geo Design",
    description: "用幾何圖形構建獨特的視覺語言",
    tags: ["幾何", "抽象", "現代"],
    followers: 9200,
    rating: 4.6,
    image: "/placeholder.svg?height=300&width=300",
    color: "#fbbf24",
  },
]

const categories = ["全部", "療癒", "極簡", "自然", "科技", "復古", "夢幻", "實驗", "水彩", "幾何"]

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState("全部")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCreators = creators.filter((creator) => {
    const matchesCategory = selectedCategory === "全部" || creator.tags.includes(selectedCategory)
    const matchesSearch =
      searchQuery === "" ||
      creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">探索創作者宇宙</h1>
          <p className="text-lg text-muted-foreground">發現 {creators.length} 個獨特的創作星球</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜尋創作者、風格、作品..."
                className="h-12 border-border/50 bg-card/50 pl-10 backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select defaultValue="rating">
              <SelectTrigger className="w-40 border-border/50 bg-card/50 backdrop-blur-sm">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">評分最高</SelectItem>
                <SelectItem value="followers">追蹤最多</SelectItem>
                <SelectItem value="newest">最新加入</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={category === selectedCategory ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="mb-6 text-center text-sm text-muted-foreground">找到 {filteredCreators.length} 個創作者</div>

        {/* Creators Grid */}
        {filteredCreators.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCreators.map((creator) => (
              <PlanetCard key={creator.id} {...creator} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border/50 bg-card/30 p-12 text-center backdrop-blur-sm">
            <p className="text-lg text-muted-foreground">找不到符合條件的創作者</p>
            <Button
              variant="outline"
              className="mt-4 bg-transparent"
              onClick={() => {
                setSelectedCategory("全部")
                setSearchQuery("")
              }}
            >
              清除篩選
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
