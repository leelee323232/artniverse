"use client"

import { useState, useRef, useEffect } from "react"
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
  ChevronLeft,
  ChevronRight,
  Share2,
  MessageCircle,
  ThumbsUp,
  Check,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getProduct, getReviews, addToCart, apiError, type ProductResponse, type Review } from "@/lib/products-api"
import { Toaster } from "@/components/ui/toaster"
import { Share } from "@/components/share/share"

export default function ProductDetailPage() {
  const [id, setId] = useState("")
  useEffect(() => {
    // SiteGround 靜態頁面共用 shell，ID 必須取自實際網址。
    setId(window.location.pathname.match(/^\/product\/([0-9]+)\/?$/)?.[1] ?? "invalid")
  }, [])
  const { toast } = useToast()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [result, setResult] = useState<ProductResponse | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reviewError, setReviewError] = useState("")
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [saving, setSaving] = useState(false)
  const [reload, setReload] = useState(0)
  const activeId = useRef(id)
  activeId.current = id
  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    setLoading(true); setError(""); setReviewError(""); setResult(null); setReviews([])
    setSelectedImage(0); setQuantity(1); setPage(1); setLastPage(1)
    getProduct(id, controller.signal).then(setResult).catch((err) => {
      if (!controller.signal.aborted) setError(apiError(err))
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    getReviews(id, 1, controller.signal).then((response) => {
      setReviews(response.data); setLastPage(response.meta.last_page)
    }).catch((err) => { if (!controller.signal.aborted) setReviewError(apiError(err)) })
    return () => controller.abort()
  }, [id, reload])
  const loadMore = async () => {
    if (loadingReviews) return
    setLoadingReviews(true); setReviewError("")
    const nextPage = reviews.length === 0 ? 1 : page + 1
    try {
      const response = await getReviews(id, nextPage)
      if (activeId.current !== id) return
      setReviews((previous) => [...previous, ...response.data]); setPage(nextPage); setLastPage(response.meta.last_page)
    } catch (err) { if (activeId.current === id) setReviewError(apiError(err)) }
    finally { setLoadingReviews(false) }
  }
  const carouselRef = useRef<HTMLDivElement>(null)

  const product = result?.data.id === id ? result.data : null
  const recommendedProducts = result?.recommendedProducts ?? []
  const handleAddToCart = async () => {
    if (!product || saving || product.stock < 1) return
    setSaving(true)
    try {
      await addToCart(product.id, quantity)
      toast({ title: "已加入購物車", description: product.name + " × " + quantity })
    } catch (err) { toast({ title: "無法加入購物車", description: apiError(err), variant: "destructive" }) }
    finally { setSaving(false) }
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

  if (loading || error || !product) return (
    <div className="min-h-screen bg-background"><Navigation />
      <main className="container mx-auto px-4 pt-28" aria-live="polite">
        <p>{loading ? "載入商品中…" : error || "找不到商品"}</p>
        {!loading && <Button onClick={() => setReload((value) => value + 1)}>重新載入</Button>}
      </main>
    </div>
  )
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Toaster />

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
              {product.originalPrice != null && product.originalPrice > product.price && (
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
                disabled title="收藏功能尚未開放" aria-label="收藏功能尚未開放"
              >
                <Heart
                  className="h-5 w-5 text-foreground"
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
                  href={product.creatorId ? `/creator/${product.creatorId}` : "/shop"}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  by {product.creatorName ?? "平台商品"}
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
              {product.originalPrice != null && product.originalPrice > product.price && (
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
                onClick={handleAddToCart} disabled={saving || product.stock < 1}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.stock < 1 ? "已售完" : saving ? "加入中…" : "加入購物車"}
              </Button>
              <Button
                size="lg"
                className="flex-1 bg-gradient-to-r from-primary to-secondary"
                disabled title="結帳功能尚未開放"
              >
                立即購買
              </Button>
            </div>

            {/* Share */}
            <Share
              title="分享商品"
              subtitle="喜歡這個商品嗎？點擊下方按鈕分享給身邊的好友吧！"
              trigger={
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Share2 className="mr-2 h-4 w-4" />
                  分享商品
                </Button>
              }
            />

            {/* TODO(ER): 配送與保障政策尚無資料來源，暫不顯示靜態承諾。 */}
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
                          result?.reviewDistribution.find((item) => item.star === star)?.percentage ?? 0
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
                  {reviews.map((review) => (
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
                            disabled title="此功能尚未開放">
                              <ThumbsUp className="mr-1 h-4 w-4" />
                              有幫助 ({review.helpful})
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground"
                            disabled title="此功能尚未開放">
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
                  {reviewError && <p role="alert" className="mb-3 text-destructive">{reviewError}</p>}
                  {!reviewError && reviews.length === 0 && <p>目前還沒有評價。</p>}
                  {(page < lastPage || reviewError) && <Button variant="outline" disabled={loadingReviews} onClick={loadMore}>{loadingReviews ? "載入中…" : reviewError ? "重試" : "查看更多評價"}</Button>}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="mt-6">
              {/* TODO(ER): 配送方式、運費及退換貨政策需要獨立設定。 */}
              <Card className="p-6">配送資訊尚未提供，請聯繫平台確認。</Card>
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
              <a
                key={item.id}
                href="/product/1/"
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
                    {item.originalPrice != null && item.originalPrice > item.price && (
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
                      {item.originalPrice != null && item.originalPrice > item.price && (
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
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
