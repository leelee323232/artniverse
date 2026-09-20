"use client";

import type React from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock, Hammer } from "lucide-react";
import { TheCard } from "@/components/common/TheCard";

interface AuctionProductCardProps {
  id: string;
  name: string;
  image: string;
  category: string;
  creatorName: string;
  startingPrice: number;
  currentBid: number;
  minBidIncrement: number;
  hoursLeft: number;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
}

function formatTimeLeft(hoursLeft: number): { label: string; urgent: boolean } {
  if (hoursLeft <= 0) return { label: "已結束", urgent: true };
  if (hoursLeft <= 24) return { label: `${hoursLeft} 小時`, urgent: true };
  return { label: `${Math.floor(hoursLeft / 24)} 天`, urgent: false };
}

export function AuctionProductCard({
  id,
  name,
  image,
  category,
  creatorName,
  startingPrice,
  currentBid,
  minBidIncrement,
  hoursLeft,
  isFavorited,
  onToggleFavorite,
}: AuctionProductCardProps) {
  const [internalLiked, setInternalLiked] = useState(false);
  const isControlled = onToggleFavorite !== undefined;
  const isLiked = isControlled ? !!isFavorited : internalLiked;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isControlled) {
      onToggleFavorite(id);
    } else {
      setInternalLiked((prev) => !prev);
    }
  };

  const { label: timeLabel, urgent } = formatTimeLeft(hoursLeft);
  const hasBids = currentBid > startingPrice;

  return (
    <TheCard className="group relative overflow-hidden border-amber-500/40 bg-card/50 pt-0 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-amber-500/70 hover:shadow-xl hover:shadow-amber-500/20">
      {/* 頂部識別色條 */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />

      <a href={`/product/${id}`}>
        {/* 商品圖 */}
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* 競標中 badge */}
          <div className="absolute left-2 top-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-1 text-xs font-bold text-white shadow-md">
              <Hammer className="h-3 w-3" />
              競標中
            </span>
          </div>

          {/* 緊迫提示 */}
          {urgent && hoursLeft > 0 && (
            <div className="absolute right-2 top-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2 py-1 text-xs font-bold text-white">
                <Clock className="h-3 w-3" />
                最後 {hoursLeft} 小時
              </span>
            </div>
          )}

          {/* 收藏按鈕 */}
          <button
            className="absolute bottom-2 right-2 rounded-full bg-background/60 p-1.5 backdrop-blur-sm transition-colors hover:bg-background/90"
            onClick={handleToggleFavorite}
            title={isLiked ? "取消收藏" : "加入收藏"}
          >
            <Heart
              className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : "text-foreground"}`}
            />
          </button>
        </div>

        {/* 卡片內容 */}
        <div className="space-y-3 p-4">
          <div>
            <Badge variant="outline" className="mb-2 text-xs">
              {category}
            </Badge>
            <h3 className="line-clamp-2 text-base font-bold text-foreground">{name}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">by {creatorName}</p>
          </div>

          {/* 競標資訊區塊 */}
          <div className="rounded-lg bg-amber-500/8 p-3 space-y-2 border border-amber-500/15">
            {/* 目前喊價 */}
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">目前喊價</span>
              <span className="text-xl font-bold text-amber-400">
                NT$ {currentBid.toLocaleString()}
              </span>
            </div>

            {/* 每次至少加價 */}
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">每次至少</span>
              <span className="text-sm font-semibold text-orange-400">
                +NT$ {minBidIncrement.toLocaleString()}
              </span>
            </div>

            {/* 分隔線 */}
            <div className="border-t border-amber-500/15" />

            {/* 剩餘時間 */}
            <div className="flex items-center gap-1.5">
              <Clock className={`h-3.5 w-3.5 ${urgent ? "text-destructive" : "text-amber-400"}`} />
              <span className="text-xs text-muted-foreground">剩餘</span>
              <span className={`text-sm font-bold ${urgent ? "text-destructive" : "text-foreground"}`}>
                {timeLabel}
              </span>
              {!hasBids && (
                <span className="ml-auto text-xs text-muted-foreground">
                  起標 NT$ {startingPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </a>
    </TheCard>
  );
}
