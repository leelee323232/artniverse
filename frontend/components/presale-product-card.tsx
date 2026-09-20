"use client";

import type React from "react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Clock } from "lucide-react";
import { TheCard } from "@/components/common/TheCard";

interface PresaleProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  currentBackers: number;
  targetBackers: number;
  daysLeft: number;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export function PresaleProductCard({
  id,
  name,
  price,
  image,
  category,
  currentBackers,
  targetBackers,
  daysLeft,
  isFavorited,
  onToggleFavorite,
}: PresaleProductCardProps) {
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

  const progress = Math.min(Math.round((currentBackers / targetBackers) * 100), 999);
  const isGoalReached = currentBackers >= targetBackers;
  const isUrgent = daysLeft <= 7;

  return (
    <TheCard className="group relative overflow-hidden border-violet-500/40 bg-card/50 pt-0 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-violet-500/70 hover:shadow-xl hover:shadow-violet-500/20">
      {/* 頂部識別色條 */}
      <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />

      <Link href="/product/1">
        {/* 商品圖 */}
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* 預購 badge */}
          <div className="absolute left-2 top-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-2.5 py-1 text-xs font-bold text-white shadow-md">
              預購中
            </span>
          </div>

          {/* 緊迫提示 */}
          {isUrgent && (
            <div className="absolute right-2 top-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2 py-1 text-xs font-bold text-white">
                <Clock className="h-3 w-3" />
                最後 {daysLeft} 天
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
          </div>

          {/* 集資資訊區塊 */}
          <div className="rounded-lg bg-violet-500/8 p-3 space-y-2.5 border border-violet-500/15">
            {/* 進度條 */}
            <div className="space-y-1.5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isGoalReached
                      ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                      : "bg-gradient-to-r from-violet-500 to-fuchsia-500"
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={`font-bold ${isGoalReached ? "text-emerald-500" : "text-violet-400"}`}>
                  {progress}%
                </span>
                {isGoalReached && (
                  <span className="font-medium text-emerald-500">已達標</span>
                )}
              </div>
            </div>

            {/* 集資人數 ＋ 剩餘天數 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm">
                <Users className="h-4 w-4 text-violet-400" />
                <span className="font-bold text-foreground">{currentBackers.toLocaleString()}</span>
                <span className="text-muted-foreground">/ {targetBackers.toLocaleString()} 人</span>
              </div>
              {!isUrgent && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{daysLeft} 天</span>
                </div>
              )}
            </div>
          </div>

          {/* 價格 */}
          <div className="text-xl font-bold text-primary">NT$ {price.toLocaleString()}</div>
        </div>
      </Link>
    </TheCard>
  );
}
