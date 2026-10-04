"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/commerce/cart-context";
import { purchaseIssue, normalizeProductId } from "@/lib/commerce/cart";
import { mockProducts } from "@/mocks/admin/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TheCard } from "@/components/common/TheCard";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  creatorId: string;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export function ProductCard({
  id,
  name,
  price,
  image,
  category,
  stock,
  creatorId,
  isFavorited,
  onToggleFavorite,
}: ProductCardProps) {
  const [internalLiked, setInternalLiked] = useState(false);
  const isControlled = onToggleFavorite !== undefined;
  const isLiked = isControlled ? !!isFavorited : internalLiked;
  const { toast } = useToast();
  const { addItem, ready, now } = useCart();
  const product = mockProducts.find(p => p.id === normalizeProductId(id));
  const unavailable = ready ? purchaseIssue(product, now) : "商品載入中";

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isControlled) {
      onToggleFavorite(id);
    } else {
      setInternalLiked((prev) => !prev);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    const result = addItem(id);
    toast({ title: result.ok ? "已加入購物車" : "無法加入購物車", description: result.message, variant: result.ok ? "default" : "destructive" });
  };

  return (
    <TheCard className="group overflow-hidden border-border/50 bg-card/50 pt-0 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
      <Link href={{ pathname: "/product", query: { id } }}>
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
            onClick={handleToggleFavorite}
            title={isLiked ? "取消收藏" : "加入收藏"}
          >
            <Heart
              className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : "text-foreground"}`}
            />
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
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-secondary"
              onClick={handleAddToCart}
              disabled={!!unavailable}
              title={unavailable ?? "加入購物車"}
            >
              <ShoppingCart className="mr-1 h-4 w-4" />
              加入購物車
            </Button>
          </div>
        </div>
      </Link>
    </TheCard>
  );
}
