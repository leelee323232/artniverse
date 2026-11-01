"use client";

import type React from "react";

import { useRef, useState } from "react";
import Link from "next/link";
import { addCatalogItem, catalogError } from "@/lib/commerce/catalog-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TheCard } from "@/components/common/TheCard";

interface ProductCardProps {
  source?: "api" | "demo";
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
  source = "demo",
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
  const [saving, setSaving] = useState(false);
  const locked = useRef(false);
  const unavailable = source !== "api" ? "請從商店選擇資料庫商品" : saving ? "加入中…" : stock < 1 ? "商品已售完" : null;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isControlled) {
      onToggleFavorite(id);
    } else {
      setInternalLiked((prev) => !prev);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (locked.current || unavailable) return;
    locked.current = true; setSaving(true);
    try { await addCatalogItem(id); toast({ title: "已加入購物車", description: name }); }
    catch (error) { toast({ title: "無法加入購物車", description: catalogError(error), variant: "destructive" }); }
    finally { locked.current = false; setSaving(false); }
  };

  return (
    <TheCard className="group overflow-hidden border-border/50 bg-card/50 pt-0 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
      <Link href={source === "api" ? { pathname: "/product", query: { id } } : "/shop"}>
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <button
            className="absolute bottom-2 right-2 rounded-full bg-background/60 p-1.5 backdrop-blur-sm transition-colors hover:bg-background/90"
            onClick={handleToggleFavorite}
            title={isLiked ? "取消收藏" : "加入收藏"}
          >
            <Heart
              className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : "text-foreground"}`}
            />
          </button>
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
