"use client"

import { useState, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Star,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Share2,
  MessageCircle,
  ThumbsUp,
  Check,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const allProducts = [
  {
    id: "1",
    name: "星空露營燈",
    price: 1280,
    originalPrice: 1580,
    images: [
      "/cute-notebook-with-stars.jpg",
      "/dreamy-postcards.jpg",
      "/planet-badges.jpg",
    ],
    category: "戶外用品",
    categoryId: "outdoor",
    stock: 45,
    sold: 328,
    rating: 4.8,
    reviewCount: 156,
    creatorId: "1",
    creatorName: "星際旅人",
    description:
      "這款星空露營燈將夜空的璀璨星光帶入您的戶外冒險。採用高品質LED燈珠，可投射出逼真的星空效果，讓您在帳篷內也能欣賞滿天繁星。USB充電設計，一次充電可持續使用8-10小時。",
    features: [
      "投射真實星空效果",
      "USB充電，續航8-10小時",
      "三種亮度模式調節",
      "防水等級IPX4",
      "輕巧便攜，僅重180g",
    ],
    specifications: {
      材質: "ABS環保塑料 + 矽膠",
      尺寸: "直徑 8cm x 高 12cm",
      重量: "180g",
      電池容量: "2000mAh",
      防水等級: "IPX4",
      光源: "LED 暖白光 + RGB",
    },
  },
  {
    id: "2",
    name: "宇宙圖騰抱枕",
    price: 880,
    originalPrice: 1080,
    images: [
      "/dreamy-postcards.jpg",
      "/cute-notebook-with-stars.jpg",
      "/universe-tote-bag.jpg",
    ],
    category: "客廳",
    categoryId: "living-room",
    stock: 23,
    sold: 512,
    rating: 4.9,
    reviewCount: 234,
    creatorId: "2",
    creatorName: "夢境畫師",
    description:
      "獨特的宇宙圖騰設計，由知名插畫家手繪創作。採用高密度記憶棉填充，觸感柔軟舒適。外套可拆洗，方便日常清潔保養。",
    features: [
      "原創手繪宇宙圖騰",
      "高密度記憶棉填充",
      "外套可拆洗設計",
      "雙面不同圖案",
      "環保印染不褪色",
    ],
    specifications: {
      材質: "天鵝絨面料 + 記憶棉",
      尺寸: "45cm x 45cm",
      重量: "450g",
      填充物: "高密度記憶棉",
      清洗方式: "外套可機洗",
    },
  },
  {
    id: "3",
    name: "星座馬克杯組",
    price: 650,
    originalPrice: 780,
    images: [
      "/planet-badges.jpg",
      "/cute-bear-stickers.jpg",
      "/cute-notebook-with-stars.jpg",
    ],
    category: "廚房",
    categoryId: "kitchen",
    stock: 8,
    sold: 892,
    rating: 4.7,
    reviewCount: 445,
    creatorId: "3",
    creatorName: "色彩魔法師",
    description:
      "十二星座系列馬克杯，每個杯子都印有獨特的星座圖案和幸運色系。食品級陶瓷材質，可微波加熱，適合日常使用。",
    features: [
      "十二星座獨特設計",
      "食品級陶瓷材質",
      "可微波加熱",
      "大容量350ml",
      "附精美禮盒包裝",
    ],
    specifications: {
      材質: "高溫燒製陶瓷",
      容量: "350ml",
      尺寸: "直徑 8.5cm x 高 10cm",
      重量: "320g",
      包裝: "精美禮盒",
    },
  },
  {
    id: "4",
    name: "月球夜燈",
    price: 1580,
    originalPrice: 1880,
    images: [
      "/universe-tote-bag.jpg",
      "/planet-badges.jpg",
      "/dreamy-postcards.jpg",
    ],
    category: "臥室",
    categoryId: "bedroom",
    stock: 15,
    sold: 267,
    rating: 4.9,
    reviewCount: 189,
    creatorId: "1",
    creatorName: "星際旅人",
    description:
      "3D列印技術還原真實月球表面紋理，搭配觸控調光功能，營造溫馨的臥室氛圍。木質底座設計，可懸浮磁吸展示。",
    features: [
      "3D列印真實月球紋理",
      "磁懸浮展示底座",
      "觸控式三段調光",
      "USB充電無線使用",
      "原木底座工藝",
    ],
    specifications: {
      材質: "PLA環保材料 + 原木",
      直徑: "15cm",
      底座尺寸: "12cm x 12cm x 3cm",
      重量: "580g（含底座）",
      充電時間: "2-3小時",
      續航時間: "6-8小時",
    },
  },
  {
    id: "5",
    name: "銀河系香氛掛飾",
    price: 450,
    originalPrice: 520,
    images: [
      "/cute-bear-stickers.jpg",
      "/cute-notebook-with-stars.jpg",
      "/dreamy-postcards.jpg",
    ],
    category: "車用",
    categoryId: "car",
    stock: 67,
    sold: 1203,
    rating: 4.6,
    reviewCount: 678,
    creatorId: "4",
    creatorName: "奇幻製造者",
    description:
      "銀河系造型香氛掛飾，內含天然精油香氛片，可持續散發清新香氣約30天。獨特的星球造型設計，為您的愛車增添藝術氣息。",
    features: [
      "天然精油配方",
      "持香約30天",
      "可替換香氛片",
      "360度旋轉設計",
      "多款星球造型可選",
    ],
    specifications: {
      材質: "鋅合金 + 水晶玻璃",
      尺寸: "5cm x 5cm x 8cm",
      重量: "45g",
      香氛成分: "天然植物精油",
      持香時間: "約30天",
    },
  },
]

const mockReviews = [
  {
    id: 1,
    userName: "小星星",
    avatar: "/cute-bear-stickers.jpg",
    rating: 5,
    date: "2024-03-15",
    content:
      "非常喜歡這個產品！質感很好，設計也很有創意。送貨速度很快，包裝也很用心。會推薦給朋友們！",
    images: ["/cute-notebook-with-stars.jpg"],
    helpful: 45,
    verified: true,
  },
  {
    id: 2,
    userName: "宇宙探險家",
    avatar: "/planet-badges.jpg",
    rating: 5,
    date: "2024-03-10",
    content:
      "品質超乎預期！之前買過類似的產品都沒有這麼精緻。創作者的設計真的很有品味，每個細節都很講究。",
    images: [],
    helpful: 32,
    verified: true,
  },
  {
    id: 3,
    userName: "生活美學家",
    avatar: "/dreamy-postcards.jpg",
    rating: 4,
    date: "2024-03-05",
    content:
      "整體來說很滿意，唯一小缺點是顏色比圖片稍微深一點，但不影響整體美觀。客服回覆也很快，服務很好。",
    images: ["/universe-tote-bag.jpg", "/dreamy-postcards.jpg"],
    helpful: 28,
    verified: true,
  },
  {
    id: 4,
    userName: "藝術愛好者",
    avatar: "/cute-mascot-design.jpg",
    rating: 5,
    date: "2024-02-28",
    content:
      "第三次購買了！送禮自用兩相宜，朋友們都很喜歡。希望能出更多系列！",
    images: [],
    helpful: 19,
    verified: true,
  },
]

export default function ProductDetailPage() {
  const params = useParams()
  const { toast } = useToast()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  const product = allProducts.find((p) => p.id === params.id) || allProducts[0]
  const relatedProducts = allProducts.filter(
    (p) => p.id !== product.id && p.categoryId === product.categoryId
  )
  const otherProducts = allProducts.filter(
    (p) => p.id !== product.id && p.categoryId !== product.categoryId
  )
  const recommendedProducts = [...relatedProducts, ...otherProducts].slice(0, 6)

  const handleAddToCart = () => {
    toast({
      title: "已加入購物車",
      description: `${product.name} x ${quantity} 已成功加入購物車`,
    })
  }

  const handleBuyNow = () => {
    toast({
      title: "前往結帳",
      description: "正在為您準備結帳頁面...",
    })
  }

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 300
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 pb-20 pt-24">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/shop" className="hover:text-primary">
            商店
          </Link>
          <span>/</span>
          <Link href={`/shop?category=${product.categoryId}`} className="hover:text-primary">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Product Info Section */}
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-border/50 bg-card/30">
              <img
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              {product.originalPrice > product.price && (
                <Badge className="absolute left-4 top-4 bg-red-500">
                  {Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100
                  )}
                  % OFF
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 bg-background/50 backdrop-blur-sm hover:bg-background/80"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart
                  className={`h-5 w-5 ${
                    isLiked ? "fill-red-500 text-red-500" : "text-foreground"
                  }`}
                />
              </Button>
            </div>

            <div className="flex gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square w-20 overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImage === index
                      ? "border-primary"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="outline">{product.category}</Badge>
                <Link
                  href={`/creator/${product.creatorId}`}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  by {product.creatorName}
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted"
                    }`}
                  />
                ))}
                <span className="ml-1 font-medium">{product.rating}</span>
              </div>
              <Separator orientation="vertical" className="h-5" />
              <span className="text-muted-foreground">
                {product.reviewCount} 則評價
              </span>
              <Separator orientation="vertical" className="h-5" />
              <span className="text-muted-foreground">
                已售出 {product.sold}+
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">
                NT$ {product.price.toLocaleString()}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xl text-muted-foreground line-through">
                  NT$ {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Features */}
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">產品特色</h3>
              <ul className="space-y-1">
                {product.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <Check className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="font-medium text-foreground">數量</span>
              <div className="flex items-center rounded-lg border border-border">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                庫存 {product.stock} 件
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                加入購物車
              </Button>
              <Button
                size="lg"
                className="flex-1 bg-gradient-to-r from-primary to-secondary"
                onClick={handleBuyNow}
              >
                立即購買
              </Button>
            </div>

            {/* Share */}
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Share2 className="mr-2 h-4 w-4" />
              分享商品
            </Button>

            {/* Service Guarantees */}
            <div className="grid grid-cols-3 gap-4 rounded-xl border border-border/50 bg-card/30 p-4">
              <div className="flex flex-col items-center gap-2 text-center">
                <Truck className="h-6 w-6 text-primary" />
                <span className="text-sm text-muted-foreground">
                  滿 $1000 免運
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-sm text-muted-foreground">
                  正品保證
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <RotateCcw className="h-6 w-6 text-primary" />
                <span className="text-sm text-muted-foreground">
                  7天鑑賞期
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16">
          <Tabs defaultValue="specs" className="w-full">
            <TabsList className="w-full justify-start border-b border-border bg-transparent p-0">
              <TabsTrigger
                value="specs"
                className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                商品規格
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                顧客評價 ({product.reviewCount})
              </TabsTrigger>
              <TabsTrigger
                value="shipping"
                className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                配送說明
              </TabsTrigger>
            </TabsList>

            <TabsContent value="specs" className="mt-6">
              <Card className="border-border/50 bg-card/30 p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between border-b border-border/50 pb-3"
                    >
                      <span className="text-muted-foreground">{key}</span>
                      <span className="font-medium text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {/* Review Summary */}
                <Card className="border-border/50 bg-card/30 p-6">
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary">
                        {product.rating}
                      </div>
                      <div className="mt-2 flex justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {product.reviewCount} 則評價
                      </div>
                    </div>
                    <Separator orientation="vertical" className="h-20" />
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const percentage =
                          star === 5 ? 75 : star === 4 ? 18 : star === 3 ? 5 : 2
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="w-12 text-sm text-muted-foreground">
                              {star} 星
                            </span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full bg-amber-400"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="w-10 text-sm text-muted-foreground">
                              {percentage}%
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </Card>

                {/* Review List */}
                <div className="space-y-4">
                  {mockReviews.map((review) => (
                    <Card
                      key={review.id}
                      className="border-border/50 bg-card/30 p-6"
                    >
                      <div className="flex gap-4">
                        <img
                          src={review.avatar || "/placeholder.svg"}
                          alt={review.userName}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">
                                {review.userName}
                              </span>
                              {review.verified && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  已購買
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {review.date}
                            </span>
                          </div>
                          <div className="mt-1 flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="mt-3 text-muted-foreground">
                            {review.content}
                          </p>
                          {review.images.length > 0 && (
                            <div className="mt-3 flex gap-2">
                              {review.images.map((img, index) => (
                                <img
                                  key={index}
                                  src={img || "/placeholder.svg"}
                                  alt={`Review ${index + 1}`}
                                  className="h-20 w-20 rounded-lg object-cover"
                                />
                              ))}
                            </div>
                          )}
                          <div className="mt-4 flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground"
                            >
                              <ThumbsUp className="mr-1 h-4 w-4" />
                              有幫助 ({review.helpful})
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground"
                            >
                              <MessageCircle className="mr-1 h-4 w-4" />
                              回覆
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="text-center">
                  <Button variant="outline">查看更多評價</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="mt-6">
              <Card className="border-border/50 bg-card/30 p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 font-semibold text-foreground">
                      配送方式
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        宅配到府：約 2-5 個工作天
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        超商取貨：約 3-7 個工作天
                      </li>
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="mb-3 font-semibold text-foreground">
                      運費說明
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        滿 NT$1,000 免運費
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        宅配運費：NT$80
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        超商取貨運費：NT$60
                      </li>
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="mb-3 font-semibold text-foreground">
                      退換貨政策
                    </h3>
                    <p className="text-muted-foreground">
                      商品到貨後享有 7
                      天鑑賞期，如需退換貨請保持商品完整包裝，並於鑑賞期內聯繫客服。客製化商品恕不接受退換貨。
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Recommended Products Carousel */}
        <section className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">你可能也會喜歡</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => scrollCarousel("left")}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => scrollCarousel("right")}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {recommendedProducts.map((item) => (
              <Link
                key={item.id}
                href={`/product/${item.id}`}
                className="flex-shrink-0"
                style={{ scrollSnapAlign: "start" }}
              >
                <Card className="group w-64 overflow-hidden border-border/50 bg-card/30 transition-all hover:border-primary/50 hover:shadow-lg">
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={item.images[0] || "/placeholder.svg"}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {item.originalPrice > item.price && (
                      <Badge className="absolute left-2 top-2 bg-red-500">
                        {Math.round(
                          ((item.originalPrice - item.price) /
                            item.originalPrice) *
                            100
                        )}
                        % OFF
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <Badge variant="outline" className="mb-2 text-xs">
                      {item.category}
                    </Badge>
                    <h3 className="mb-2 font-semibold text-foreground line-clamp-1">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">
                        NT$ {item.price.toLocaleString()}
                      </span>
                      {item.originalPrice > item.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          NT$ {item.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {item.rating} | 已售 {item.sold}+
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
