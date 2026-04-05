"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { UniverseBackground } from "@/components/universe-background"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Link from "next/link"

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
  const [cartItems, setCartItems] = useState(initialCartItems)

  const updateQuantity = (id: string, change: number) => {
    setCartItems((items) =>
      items
        .map((item) => {
          if (item.id === id) {
            const newQuantity = Math.max(0, item.quantity + change)
            return { ...item, quantity: newQuantity }
          }
          return item
        })
        .filter((item) => item.quantity > 0),
    )
  }

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 1000 ? 0 : 80
  const total = subtotal + shipping

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">購物車</h1>
          <p className="text-muted-foreground">{cartItems.length} 件商品</p>
        </div>

        {cartItems.length === 0 ? (
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
                          href={`/creator/${item.creatorId}`}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          {item.creator}
                        </Link>
                        <h3 className="font-bold text-foreground">{item.name}</h3>
                        <p className="text-lg font-bold text-primary">NT$ {item.price}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input type="number" value={item.quantity} className="h-8 w-16 text-center" readOnly />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.id)}
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
                    <span>NT$ {subtotal}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>運費</span>
                    <span>{shipping === 0 ? "免運費" : `NT$ ${shipping}`}</span>
                  </div>
                  {subtotal < 1000 && <p className="text-xs text-muted-foreground">滿 NT$ 1,000 免運費</p>}

                  <Separator />

                  <div className="flex justify-between text-lg font-bold text-foreground">
                    <span>總計</span>
                    <span>NT$ {total}</span>
                  </div>
                </div>

                <Button className="mt-6 w-full bg-gradient-to-r from-primary to-secondary" size="lg">
                  前往結帳
                </Button>
              </Card>

              <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
                <h3 className="mb-3 font-bold text-foreground">優惠碼</h3>
                <div className="flex gap-2">
                  <Input placeholder="輸入優惠碼" className="bg-background/50" />
                  <Button variant="outline">套用</Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
