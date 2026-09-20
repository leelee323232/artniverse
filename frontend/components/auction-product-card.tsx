"use client";

import type React from "react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock, Hammer } from "lucide-react";
import { TheCard } from "@/components/common/TheCard";
import {
  AUCTION_STATUS_LABEL,
  formatProductDateTime,
  getAuctionPrices,
  getAuctionStatus,
  getHoursLeft,
} from "@/lib/products/status";

interface AuctionProductCardProps {
  id: string;
  name: string;
  image: string;
  category: string;
  creatorName: string;
  startingPrice: number;
  currentBid: number;
  minBidIncrement: number;
  auctionStartTime?: string | null;
  auctionEndTime?: string | null;
  hoursLeft?: number;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
}

function formatTimeLeft(hoursLeft: number): { label: string; urgent: boolean } {
  if (hoursLeft <= 0) return { label: "已結束", urgent: true };
  if (hoursLeft <= 24) return { label: `${hoursLeft} 小時`, urgent: true };
  return { label: `${Math.floor(hoursLeft / 24)} 天`, urgent: false };
}

const STATUS_BADGE_CLASS = {
  live: "bg-gradient-to-r from-amber-400 to-orange-500 text-white",
  upcoming: "bg-sky-500 text-white",
  ended: "bg-muted text-muted-foreground",
} as const;

export function AuctionProductCard({
  id,
  name,
  image,
  category,
  creatorName,
  startingPrice,
  currentBid,
  minBidIncrement,
  auctionStartTime,
  auctionEndTime,
  hoursLeft: hoursLeftProp,
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

  const prices = getAuctionPrices({
    price: startingPrice,
    startingPrice,
    currentBid,
    minBidIncrement,
  });
  const status = getAuctionStatus(auctionStartTime, auctionEndTime);
  const hoursLeft =
    auctionEndTime != null
      ? getHoursLeft(auctionEndTime)
      : (hoursLeftProp ?? 0);
  const { label: timeLabel, urgent } = formatTimeLeft(hoursLeft);
  const hasBids = prices.currentBid > prices.startingPrice;

  return (
    <TheCard className="group relative overflow-hidden border-amber-500/40 bg-card/50 pt-0 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-amber-500/70 hover:shadow-xl hover:shadow-amber-500/20">
      {/* 頂部識別色條 */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />

      <Link href="/product/1">
        {/* 商品圖 */}
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          <div className="absolute left-2 top-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-md ${STATUS_BADGE_CLASS[status]}`}
            >
              <Hammer className="h-3 w-3" />
              {AUCTION_STATUS_LABEL[status]}
            </span>
          </div>

          {status === "live" && urgent && hoursLeft > 0 && (
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
                NT$ {prices.currentBid.toLocaleString()}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">每次至少</span>
              <span className="text-sm font-semibold text-orange-400">
                +NT$ {prices.minBidIncrement.toLocaleString()}
              </span>
            </div>

            <div className="border-t border-amber-500/15" />

            <div className="space-y-1 text-xs text-muted-foreground">
              <div>開始 {formatProductDateTime(auctionStartTime)}</div>
              <div>結束 {formatProductDateTime(auctionEndTime)}</div>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className={`h-3.5 w-3.5 ${urgent && status === "live" ? "text-destructive" : "text-amber-400"}`} />
              <span className="text-xs text-muted-foreground">
                {status === "upcoming" ? "距離開始" : "剩餘"}
              </span>
              <span
                className={`text-sm font-bold ${urgent && status === "live" ? "text-destructive" : "text-foreground"}`}
              >
                {status === "upcoming"
                  ? formatTimeLeft(getHoursLeft(auctionStartTime)).label
                  : timeLabel}
              </span>
              {!hasBids && status !== "ended" && (
                <span className="ml-auto text-xs text-muted-foreground">
                  起標 NT$ {prices.startingPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </TheCard>
  );
}
