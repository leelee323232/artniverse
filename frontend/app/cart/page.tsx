"use client"

import { useState, useEffect } from "react"
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
  image: string; creator: string; creatorId: string | null; stock: number; isAvailable: boolean;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [reload, setReload] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError("")
    api.get<{ data: CartItem[] }>("/api/v1/cart", { signal: controller.signal })
      .then(({ data }) => setCartItems(data.data))
      .catch((err) => { if (!controller.signal.aborted) setError(apiError(err)) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [reload])
  const mutateCart = async (id: string, quantity?: number) => {
    if (saving) return
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

        {error && <p role="alert" className="mb-4 text-destructive">{error} <Button variant="outline" onClick={() => setReload((value) => value + 1)}>重試</Button></p>}
        {loading ? <p role="status">載入購物車中…</p> : error && cartItems.length === 0 ? null : cartItems.length === 0 ? (
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
                <Card key={item.id} className="border-border/50 bg-card/30 p-4 backdrop-blur-sm">
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
                        {(!item.isAvailable || item.quantity > item.stock) && <p className="text-destructive">商品已下架或庫存不足，請調整購物車。</p>}
                        <p className="text-lg font-bold text-primary">NT$ {item.price}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
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
                            disabled={saving || loading || !item.isAvailable || item.quantity >= item.stock} onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

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

                <Button disabled title="訂單與配送功能尚未開放" className="mt-6 w-full bg-gradient-to-r from-primary to-secondary" size="lg">
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
