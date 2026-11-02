"use client"

import { useState, useRef, useEffect } from "react"
import { ComingSoon } from "@/components/common/ComingSoon"
import { useRouter, useSearchParams } from "next/navigation"
import { catalog, catalogProduct, addCatalogItem, catalogError, type CatalogProduct } from "@/lib/commerce/catalog-api"
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
import { Share } from "@/components/share/share"
import { demoCatalog } from "@/lib/commerce/demo-catalog"
import { AuctionPanel } from "./auction-panel"

export default function ProductDetailPage() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  return <ProductLoader key={id} id={id} />;
}

function ProductLoader({ id }: { id: string }) {
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [allProducts, setAllProducts] = useState<CatalogProduct[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(""); setProduct(null);
    if (id.startsWith("demo-")) {
      const demos = demoCatalog();
      setProduct(demos.find(p => p.id === id) ?? null);
      setAllProducts(demos);
      if (!demos.some(p => p.id === id)) setError("找不到示範商品，請返回商店。");
      setLoading(false);
      return () => controller.abort();
    }
    if (!/^\d+$/.test(id)) { setError("商品 ID 無效，請從商店重新選擇。"); setLoading(false); return () => controller.abort(); }
    void catalogProduct(id, controller.signal).then(data => { if (!controller.signal.aborted) setProduct(data); })
      .catch(e => { if (!controller.signal.aborted) setError(catalogError(e)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    void catalog(controller.signal).then(data => { if (!controller.signal.aborted) setAllProducts([...data.filter(p => p.productType === "general"), ...demoCatalog()]); }).catch(() => {});
    return () => controller.abort();
  }, [id, reload]);
  if (!loading && product) return <ProductDetail product={product} allProducts={allProducts} />;
  return <div className="min-h-screen bg-background"><Navigation /><main className="container mx-auto space-y-4 px-4 pb-20 pt-24">{loading ? <p role="status">載入商品中…</p> : <><p role="alert">{error}</p><Button onClick={() => setReload(n => n + 1)}>重新載入</Button></>}<Link href="/shop" className="block underline">返回商店</Link></main></div>;
}

function ProductDetail({ product, allProducts }: { product: CatalogProduct; allProducts: CatalogProduct[] }) {
  const { toast } = useToast()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const locked = useRef(false)
  const ready = true
  const unavailable = saving ? "加入中…" : !product.isActive ? "商品已下架" : product.productType !== "general" ? "預售／競標付款尚未開放" : product.stock < 1 ? "商品已售完" : null
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  const relatedProducts = allProducts.filter(
    (p) => p.isActive && p.id !== product.id && p.categoryId === product.categoryId
  )
  const otherProducts = allProducts.filter(
    (p) => p.isActive && p.id !== product.id && p.categoryId !== product.categoryId
  )
  const recommendedProducts = [...relatedProducts, ...otherProducts].slice(0, 6)

  const handleAddToCart = async () => {
    if (locked.current || unavailable) return false
    locked.current = true; setSaving(true)
    try { await addCatalogItem(product.id, quantity); toast({ title: "已加入購物車", description: product.name }); return true }
    catch (e) { toast({ title: "無法加入購物車", description: catalogError(e), variant: "destructive" }); return false }
    finally { locked.current = false; setSaving(false) }
  }
  const handleBuyNow = async () => { if (await handleAddToCart()) router.push("/cart") }

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
        {product.isDemo && <p className="mb-5 rounded-lg bg-amber-500/10 p-3 text-sm">此商品為匯入的測試資料，僅供測試環境使用。</p>}
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
              {product.productType !== "auction" && product.originalPrice > product.price && (
                <Badge className="absolute left-4 top-4 bg-red-500">
                  {Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100
                  )}
                  % OFF
                </Badge>
              )}
              <ComingSoon>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4 bg-background/50 backdrop-blur-sm hover:bg-background/80"
                >
                  <Heart className="h-5 w-5 text-foreground" />
                </Button>
              </ComingSoon>
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

            {/* 沒有評價不等於零分。 */}
            {product.productType !== "auction" && (
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {product.rating !== null ? (
                  <>
                    <div className="flex items-center gap-1" aria-label={`平均評分 ${product.rating.toFixed(1)} 分，滿分 5 分`}>
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{product.rating.toFixed(1)} / 5</span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="text-muted-foreground">{product.reviewCount} 則評價</span>
                  </>
                ) : <span className="text-muted-foreground">尚無評價</span>}
                {product.sold !== null && <>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-muted-foreground">已售出 {product.sold.toLocaleString()} 件</span>
                </>}
              </div>
            )}

            {/* Price */}
            {product.productType !== "auction" && <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">
                NT$ {product.price.toLocaleString()}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xl text-muted-foreground line-through">
                  NT$ {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>}

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Features */}
            {product.features.length > 0 && <div className="space-y-2">
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
            </div>}

            {product.productType === "auction" ? (
              product.id.startsWith("demo-") ? <AuctionPanel product={product} /> : <p className="rounded-lg border p-4">競標付款尚未開放。</p>
            ) : (
              <>
                {product.productType === "presale" && <section className="space-y-2 rounded-lg border border-violet-500/30 bg-violet-500/5 p-4" aria-label="預售購買須知">
                  <h2 className="font-bold">預售商品</h2>
                  <p>目前 {product.currentBackers ?? 0} / {product.targetBackers ?? 0} 人；達標或截止即停止購買。</p>
                  <p className="text-sm text-muted-foreground">預售期間：{ready && product.presaleStartTime ? new Date(product.presaleStartTime).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" }) : "待確認"} ～ {ready && product.presaleEndTime ? new Date(product.presaleEndTime).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" }) : "待確認"}（台灣時間）</p>
                  <p className="text-sm">目前僅供展示預售資料，尚未開放購物車與付款。</p>
                </section>}
                {unavailable && <p role="status" className="text-sm text-amber-500">{unavailable}</p>}
                {/* Quantity */}
                <div className="flex items-center gap-4">
                  <span className="font-medium text-foreground">數量</span>
                  <div className="flex items-center rounded-lg border border-border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={!!unavailable || quantity <= 1}
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
                      disabled={!!unavailable || quantity >= product.stock}
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
                    disabled={!!unavailable}
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    加入購物車
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-primary to-secondary"
                    disabled={!!unavailable}
                    onClick={handleBuyNow}
                  >
                    {unavailable ?? "加入並查看購物車"}
                  </Button>
                </div>

              </>
            )}

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
            <TabsList className="w-full justify-start overflow-x-auto border-b border-border bg-transparent p-0">
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
                顧客評價{product.reviewCount > 0 ? ` (${product.reviewCount})` : ""}
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
                  {Object.keys(product.specifications).length === 0 && <p className="text-sm text-muted-foreground">商品規格尚未提供。</p>}
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex min-w-0 justify-between gap-4 border-b border-border/50 pb-3"
                    >
                      <span className="shrink-0 text-muted-foreground">{key}</span>
                      <span className="min-w-0 whitespace-pre-wrap break-words text-right font-medium text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              {product.isDemo && <p className="mb-4 rounded-lg bg-amber-500/10 p-3">以下為匯入的示範評論，並非真實買家評價。</p>}
              {product.rating === null ? (
                <Card className="border-border/50 bg-card/30 p-8 text-center">
                  <p className="font-medium">尚無評價</p>
                  <p className="mt-2 text-sm text-muted-foreground">此商品目前還沒有顧客評價。</p>
                </Card>
              ) : <div className="space-y-6">
                {/* Review Summary */}
                <Card className="border-border/50 bg-card/30 p-6">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary">
                        {product.rating.toFixed(1)}
                      </div>
                      <div className="mt-2 flex justify-center" aria-label={`平均 ${product.rating.toFixed(1)} 分，滿分 5 分`}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating ?? 0)
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
                    <Separator orientation="vertical" className="hidden h-20 sm:block" />
                    <div className="w-full flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const percentage =
                          Math.round(product.reviews.filter((review) => review.rating === star).length / product.reviewCount * 100)
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
                  {product.reviews.map((review) => (
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
                            <ComingSoon>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground"
                              >
                                <ThumbsUp className="mr-1 h-4 w-4" />
                                有幫助 ({review.helpful})
                              </Button>
                            </ComingSoon>
                            <ComingSoon>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground"
                              >
                                <MessageCircle className="mr-1 h-4 w-4" />
                                回覆
                              </Button>
                            </ComingSoon>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

              </div>}
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
                aria-label="查看前面的推薦商品"
                onClick={() => scrollCarousel("left")}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                aria-label="查看後面的推薦商品"
                onClick={() => scrollCarousel("right")}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div
            ref={carouselRef}
            className="product-recommendations-scroll flex gap-6 overflow-x-auto pb-4"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {recommendedProducts.map((item) => (
              <Link
                key={item.id}
                href={{ pathname: "/product", query: { id: item.id } }}
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
                    {item.productType !== "auction" && item.originalPrice > item.price && (
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
                        NT$ {(item.productType === "auction" ? item.currentBid ?? item.auctionStartPrice ?? item.price : item.price).toLocaleString()}
                      </span>
                      {item.productType !== "auction" && item.originalPrice > item.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          NT$ {item.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {item.productType === "auction" ? <span>競標商品・目前出價</span> : <>
                        {item.rating !== null ? <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />{item.rating.toFixed(1)} / 5
                        </span> : <span>尚無評價</span>}
                        {item.sold !== null && <span>・已售 {item.sold.toLocaleString()} 件</span>}
                      </>}
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
