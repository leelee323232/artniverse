"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, ExternalLink, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  creator: string
  isNew?: boolean
  isSale?: boolean
}

const latestProducts: Product[] = [
  {
    id: "1",
    name: "手繪水彩明信片組",
    price: 280,
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300",
    creator: "小雨插畫",
    isNew: true,
  },
  {
    id: "2",
    name: "復古印花托特包",
    price: 680,
    originalPrice: 850,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=300",
    creator: "織夢工坊",
    isSale: true,
  },
  {
    id: "3",
    name: "陶瓷手捏杯",
    price: 450,
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300",
    creator: "土土陶藝",
    isNew: true,
  },
  {
    id: "4",
    name: "植物刺繡掛飾",
    price: 520,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300",
    creator: "針線花園",
  },
  {
    id: "5",
    name: "木質手機支架",
    price: 380,
    originalPrice: 480,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300",
    creator: "木子手作",
    isSale: true,
  },
]

const recommendedProducts: Product[] = [
  {
    id: "6",
    name: "手工皮革筆記本",
    price: 890,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=300",
    creator: "皮革工坊",
    isNew: true,
  },
  {
    id: "7",
    name: "藍染方巾",
    price: 350,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300",
    creator: "染織坊",
  },
  {
    id: "8",
    name: "金工耳環",
    price: 1280,
    originalPrice: 1500,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300",
    creator: "金工小姐",
    isSale: true,
  },
]

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.id}`} className="block group">
      <div className="relative rounded-xl overflow-hidden bg-muted aspect-square mb-2">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.isNew && (
          <Badge className="absolute top-2 left-2 bg-violet-500 text-white text-[10px] px-2 py-0.5 border-0">
            NEW
          </Badge>
        )}
        {product.isSale && (
          <Badge className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] px-2 py-0.5 border-0">
            SALE
          </Badge>
        )}
        <Button
          size="sm"
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white text-foreground h-8 w-8 p-0 rounded-full"
        >
          <ShoppingBag className="h-4 w-4" />
        </Button>
      </div>
      <div className="px-1">
        <p className="font-medium text-sm truncate group-hover:text-violet-500 transition-colors">
          {product.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{product.creator}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-bold text-sm">NT${product.price}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              NT${product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export function ProductsSidebar() {
  return (
    <aside className="w-80 shrink-0 space-y-4 sticky top-20 h-fit">
      {/* Latest Products */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-violet-500" />
              最新商品
            </CardTitle>
            <Link
              href="/shop"
              className="text-xs text-violet-500 hover:text-violet-400 font-medium"
            >
              查看全部
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {latestProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Products Button Section */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            新品推薦
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendedProducts.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="flex gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors group"
            >
              <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-muted">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.isNew && (
                  <Badge className="absolute top-1 left-1 bg-violet-500 text-white text-[9px] px-1.5 py-0 border-0">
                    NEW
                  </Badge>
                )}
                {product.isSale && (
                  <Badge className="absolute top-1 left-1 bg-rose-500 text-white text-[9px] px-1.5 py-0 border-0">
                    SALE
                  </Badge>
                )}
              </div>
              <div className="flex-1 min-w-0 py-1">
                <p className="font-medium text-sm truncate group-hover:text-violet-500 transition-colors">
                  {product.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {product.creator}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-bold text-sm">NT${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      NT${product.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}

          <Button
            variant="outline"
            className="w-full mt-2 border-violet-500/30 text-violet-500 hover:bg-violet-500/5 hover:text-violet-400"
            asChild
          >
            <Link href="/shop/recommended">
              <Sparkles className="h-4 w-4 mr-2" />
              探索更多推薦
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Featured Banner */}
      <Card className="border-0 overflow-hidden bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-amber-500/10">
        <div className="p-5">
          <Badge className="bg-violet-500/20 text-violet-500 border-0 mb-3">
            限時優惠
          </Badge>
          <h3 className="font-bold text-lg text-foreground mb-1">
            新會員享 9 折
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            首次購物輸入優惠碼
          </p>
          <div className="flex items-center justify-between">
            <code className="bg-card px-4 py-2 rounded-lg text-sm font-mono font-bold text-violet-500">
              WELCOME10
            </code>
            <Button
              size="sm"
              className="bg-violet-500 hover:bg-violet-600 text-white"
            >
              立即使用
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </aside>
  )
}
