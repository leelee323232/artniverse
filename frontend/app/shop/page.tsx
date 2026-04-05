"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  SlidersHorizontal,
  Tent,
  Sofa,
  ChefHat,
  Bed,
  Car,
  Sparkles,
  Grid3X3,
  LayoutList,
} from "lucide-react"

const categories = [
  { id: "all", name: "全部商品", icon: Grid3X3, count: 156 },
  { id: "outdoor", name: "戶外用品", icon: Tent, count: 32 },
  { id: "living-room", name: "客廳", icon: Sofa, count: 45 },
  { id: "kitchen", name: "廚房", icon: ChefHat, count: 28 },
  { id: "bedroom", name: "臥室", icon: Bed, count: 31 },
  { id: "car", name: "車用", icon: Car, count: 20 },
]

const mockProducts = [
  {
    id: "1",
    name: "星空露營燈",
    price: 1280,
    image: "/cute-notebook-with-stars.jpg",
    category: "戶外用品",
    categoryId: "outdoor",
    stock: 45,
    creatorId: "1",
    isNew: true,
  },
  {
    id: "2",
    name: "宇宙圖騰抱枕",
    price: 880,
    image: "/dreamy-postcards.jpg",
    category: "客廳",
    categoryId: "living-room",
    stock: 23,
    creatorId: "2",
    isNew: false,
  },
  {
    id: "3",
    name: "星座馬克杯組",
    price: 650,
    image: "/planet-badges.jpg",
    category: "廚房",
    categoryId: "kitchen",
    stock: 8,
    creatorId: "3",
    isNew: true,
  },
  {
    id: "4",
    name: "月球夜燈",
    price: 1580,
    image: "/universe-tote-bag.jpg",
    category: "臥室",
    categoryId: "bedroom",
    stock: 15,
    creatorId: "1",
    isNew: false,
  },
  {
    id: "5",
    name: "銀河系香氛掛飾",
    price: 450,
    image: "/cute-bear-stickers.jpg",
    category: "車用",
    categoryId: "car",
    stock: 67,
    creatorId: "4",
    isNew: true,
  },
  {
    id: "6",
    name: "極光野餐墊",
    price: 980,
    image: "/hand-drawn-illustration-poster.jpg",
    category: "戶外用品",
    categoryId: "outdoor",
    stock: 12,
    creatorId: "2",
    isNew: false,
  },
  {
    id: "7",
    name: "星河地毯",
    price: 2480,
    image: "/wedding-invitation-illustration.jpg",
    category: "客廳",
    categoryId: "living-room",
    stock: 5,
    creatorId: "5",
    isNew: true,
  },
  {
    id: "8",
    name: "宇宙食器組",
    price: 1280,
    image: "/children-book-illustration.jpg",
    category: "廚房",
    categoryId: "kitchen",
    stock: 30,
    creatorId: "3",
    isNew: false,
  },
  {
    id: "9",
    name: "夢幻星雲被套組",
    price: 3280,
    image: "/cute-mascot-design.jpg",
    category: "臥室",
    categoryId: "bedroom",
    stock: 18,
    creatorId: "1",
    isNew: true,
  },
  {
    id: "10",
    name: "太空人車載支架",
    price: 580,
    image: "/cute-notebook-with-stars.jpg",
    category: "車用",
    categoryId: "car",
    stock: 42,
    creatorId: "4",
    isNew: false,
  },
  {
    id: "11",
    name: "星際探險帳篷",
    price: 4580,
    image: "/dreamy-postcards.jpg",
    category: "戶外用品",
    categoryId: "outdoor",
    stock: 6,
    creatorId: "2",
    isNew: false,
  },
  {
    id: "12",
    name: "行星造型時鐘",
    price: 1680,
    image: "/planet-badges.jpg",
    category: "客廳",
    categoryId: "living-room",
    stock: 22,
    creatorId: "5",
    isNew: true,
  },
]

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredProducts = mockProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.categoryId === selectedCategory
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "newest":
        return a.isNew ? -1 : 1
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-12">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-primary/20 text-primary">
              <Sparkles className="mr-1 h-3 w-3" />
              複合式生活美學
            </Badge>
            <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              讓藝術融入
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                每個生活角落
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              探索由創作者設計的獨特生活用品，從戶外探險到居家空間，讓創意點亮你的日常
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-20">
        {/* Category Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const Icon = category.icon
              const isActive = selectedCategory === category.id
              return (
                <Button
                  key={category.id}
                  variant={isActive ? "default" : "outline"}
                  className={`gap-2 ${
                    isActive
                      ? "bg-gradient-to-r from-primary to-secondary"
                      : "bg-card/50 hover:bg-card"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                  <Badge
                    variant="secondary"
                    className={`ml-1 ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {category.count}
                  </Badge>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜尋商品..."
              className="bg-card/50 pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 bg-card/50">
                  <SelectValue placeholder="排序方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">最新上架</SelectItem>
                  <SelectItem value="price-low">價格低到高</SelectItem>
                  <SelectItem value="price-high">價格高到低</SelectItem>
                  <SelectItem value="popular">熱門商品</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex rounded-lg border border-border bg-card/50 p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            顯示{" "}
            <span className="font-medium text-foreground">
              {sortedProducts.length}
            </span>{" "}
            件商品
            {selectedCategory !== "all" && (
              <>
                {" "}
                在{" "}
                <span className="font-medium text-primary">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Products Grid */}
        {sortedProducts.length > 0 ? (
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}
          >
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                category={product.category}
                stock={product.stock}
                creatorId={product.creatorId}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              找不到符合的商品
            </h3>
            <p className="text-muted-foreground">
              嘗試調整搜尋條件或瀏覽其他分類
            </p>
          </div>
        )}

        {/* Category Highlights */}
        <section className="mt-20">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
            探索各空間的
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              藝術靈感
            </span>
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.slice(1).map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 p-8 text-left backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/50"
                >
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-2xl transition-all group-hover:scale-150" />
                  <Icon className="mb-4 h-10 w-10 text-primary" />
                  <h3 className="mb-2 text-xl font-bold text-foreground">
                    {category.name}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {category.count} 件精選商品
                  </p>
                  <span className="text-sm font-medium text-primary">
                    立即探索 →
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
