"use client"

import { useEffect, useState } from "react"
import { mockProducts } from "@/mocks/admin/products"
import { AUCTION_PAYMENT_WINDOW } from "@/lib/products/status"
import { Navigation } from "@/components/navigation"
import { UniverseBackground } from "@/components/universe-background"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { apiError } from "@/lib/products-api"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Link from "next/link"

interface CartItem {
  id: string; productId: string; name: string; price: number; quantity: number;
  image: string; creator: string; creatorId: string | null; stock?: number; isAvailable?: boolean; paymentDeadline?: number; source: "api" | "demo";
}

// Mock cart data
const initialCartItems = [
  {
    id: "1",
    productId: "1",
    name: "星空筆記本",
    price: 380,
    quantity: 2,
    image: "/cute-notebook-with-stars.jpg",
    creator: "小夢創作室",
    creatorId: "1",
  },
  {
    id: "2",
    productId: "2",
    name: "療癒小熊貼紙組",
    price: 120,
    quantity: 1,
    image: "/cute-bear-stickers.jpg",
    creator: "小夢創作室",
    creatorId: "1",
  },
]

export default function CartPage() {
  const [apiItems, setApiItems] = useState<CartItem[]>([])
  const [demoItems, setDemoItems] = useState<CartItem[]>(initialCartItems.map((item) => ({ ...item, id: `demo:${item.id}`, source: "demo" })))
  const cartItems = [...apiItems, ...demoItems]
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [reload, setReload] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError("")
    api.get<{ data: CartItem[] }>("/api/v1/cart", { signal: controller.signal })
      .then(({ data }) => setApiItems(data.data.map((item) => ({ ...item, source: "api" }))))
      .catch((err) => { if (!controller.signal.aborted) setError(apiError(err)) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [reload])
  useEffect(() => {
    // 只加入內頁示範得標商品；正式結帳需由 API 驗證得標資格與價格。
    const id = new URLSearchParams(window.location.search).get("auction")?.replace(/^p-(?=\d+$)/, "")
    if (!id) return
    const product = mockProducts.find((item) => item.id === id && item.productType === "auction")
    const end = Date.parse(product?.auctionEndTime ?? "")
    const deadline = end + AUCTION_PAYMENT_WINDOW
    if (!product || !Number.isFinite(end) || Date.now() < end || Date.now() >= deadline || !product.currentBid) {
      setMessage("目前沒有可加入的示範得標商品，或付款期限已過。")
      return
    }
    setDemoItems((items) => [...items.filter((item) => item.id !== `auction-${id}`), {
      source: "demo", id: `auction-${id}`, productId: product.id, name: product.name, price: product.currentBid!,
      quantity: 1, image: product.imageUrl, creator: product.creatorName ?? "創作者",
      creatorId: product.creatorId ?? "", paymentDeadline: deadline,
    }])
    setMessage("已加入示範得標商品；移除商品不會取消得標資格或重設付款期限。")
    const timer = window.setInterval(() => {
      if (Date.now() >= deadline) {
        setDemoItems((items) => items.filter((item) => item.id !== `auction-${id}`))
        setMessage("示範得標商品付款期限已過，已自購物車移除。")
        window.clearInterval(timer)
      }
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const mutateCart = async (id: string, quantity?: number) => {
    const demo = demoItems.find((item) => item.id === id)
    if (demo) {
      if (quantity == null || quantity <= 0) setDemoItems((items) => items.filter((item) => item.id !== id))
      else if (!demo.paymentDeadline) setDemoItems((items) => items.map((item) => item.id === id ? { ...item, quantity } : item))
      return
    }
    if (saving || !apiItems.some((item) => item.id === id)) return
    setSaving(true); setError("")
    try {
      await api.get("/sanctum/csrf-cookie")
      if (quantity == null || quantity <= 0) await api.delete('/api/v1/cart/' + id)
      else await api.patch('/api/v1/cart/' + id, { quantity })
      setReload((value) => value + 1)
    } catch (err) { setError(apiError(err)) }
    finally { setSaving(false) }
  }
  const updateQuantity = (id: string, change: number) => {
    const item = cartItems.find((entry) => entry.id === id)
    if (item) void mutateCart(id, item.quantity + change)
  }
  const removeItem = (id: string) => void mutateCart(id)
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">購物車</h1>
          <p className="text-muted-foreground">{cartItems.length} 件商品</p>
        </div>

        {message && <p role="status" className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">{message}</p>}
        {error && <p role="alert" className="mb-4 text-destructive">{error} <Button variant="outline" onClick={() => setReload((value) => value + 1)}>重試</Button></p>}
        {cartItems.length === 0 && loading ? <p role="status">載入購物車中…</p> : error && cartItems.length === 0 ? null : cartItems.length === 0 ? (
          <Card className="border-border/50 bg-card/30 p-12 text-center backdrop-blur-sm">
            <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-bold text-foreground">購物車是空的</h2>
            <p className="mb-6 text-muted-foreground">快去探索創作者的宇宙，找尋喜歡的商品吧！</p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-primary to-secondary">開始探索</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={`${item.source}:${item.id}`} className="border-border/50 bg-card/30 p-4 backdrop-blur-sm">
                  <div className="flex gap-4">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted/30">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <Link
                          href={item.creatorId ? `/creator/${item.creatorId}` : "/shop"}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          {item.creator}
                        </Link>
                        <h3 className="font-bold text-foreground">{item.name}</h3>
                        <span className="text-xs text-muted-foreground">{item.source === "demo" ? "展示資料・不會儲存" : "資料庫商品"}</span>
                        {item.paymentDeadline && <p className="text-xs text-amber-500">
                          競標得標・付款截止 {new Date(item.paymentDeadline).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", hour12: false })}（台灣時間）
                        </p>}
                        {(item.source === "api" && (!item.isAvailable || item.quantity > (item.stock ?? 0))) && <p className="text-destructive">商品已下架或庫存不足，請調整購物車。</p>}
                        <p className="text-lg font-bold text-primary">NT$ {item.price}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        {item.paymentDeadline ? <span className="text-sm text-muted-foreground">得標數量：1 件／組</span> : <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            disabled={saving || loading} onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input type="number" value={item.quantity} className="h-8 w-16 text-center" readOnly />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            disabled={saving || loading || (item.source === "api" && (!item.isAvailable || item.quantity >= (item.stock ?? 0)))} onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>}

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          disabled={saving || loading} onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="h-fit space-y-4">
              <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
                <h2 className="mb-4 text-xl font-bold text-foreground">訂單摘要</h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>小計</span>
                    <span>NT$ {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>運費</span>
                    <span>結帳時確認</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold text-foreground">
                    <span>商品小計（不含運費）</span>
                    <span>NT$ {subtotal.toLocaleString()}</span>
                  </div>
                </div>

                <Button className="mt-6 w-full bg-gradient-to-r from-primary to-secondary" size="lg" onClick={() => {
                  if (cartItems.some((item) => item.paymentDeadline && Date.now() >= item.paymentDeadline)) {
                    setDemoItems((items) => items.filter((item) => !item.paymentDeadline || Date.now() < item.paymentDeadline))
                    setMessage("得標付款期限已過，請重新確認購物車。")
                    return
                  }
                  setMessage("目前為購物車畫面預覽，尚未建立訂單或進行付款。")
                }}>
                  前往結帳
                </Button>
              </Card>

              <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
                <h3 className="mb-3 font-bold text-foreground">優惠碼</h3>
                <p className="text-muted-foreground">優惠碼功能尚未開放。</p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
