"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProductCardProps {
  id: string
  name: string
  price: number
  image: string
  category: string
  stock: number
  creatorId: string
}

export function ProductCard({ id, name, price, image, category, stock, creatorId }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const { toast } = useToast()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    toast({
      title: "已加入購物車",
      description: `${name} 已成功加入購物車`,
    })
  }

  return (
    <Card className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
      <Link href={`/product/${id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 bg-background/50 backdrop-blur-sm hover:bg-background/80"
            onClick={(e) => {
              e.preventDefault()
              setIsLiked(!isLiked)
            }}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : "text-foreground"}`} />
          </Button>
          {stock < 10 && (
            <Badge variant="destructive" className="absolute left-2 top-2">
              僅剩 {stock} 件
            </Badge>
          )}
        </div>

        <div className="space-y-3 p-4">
          <div>
            <Badge variant="outline" className="mb-2 text-xs">
              {category}
            </Badge>
            <h3 className="text-lg font-bold text-foreground">{name}</h3>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary">NT$ {price}</div>
            <Button size="sm" className="bg-gradient-to-r from-primary to-secondary" onClick={handleAddToCart}>
              <ShoppingCart className="mr-1 h-4 w-4" />
              加入購物車
            </Button>
          </div>
        </div>
      </Link>
    </Card>
  )
}
