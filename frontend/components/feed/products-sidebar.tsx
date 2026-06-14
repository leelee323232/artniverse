"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TheButton } from "@/components/common/TheButton";
import { useRouter } from "next/navigation";
import { TheCard } from "@/components/common/TheCard";

interface Creator {
  id: string;
  name: string;
  creator: string;
  specialty: string;
  followers: string;
  works: number;
  badge: string;
  color: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  creator: string;
  isNew?: boolean;
  isSale?: boolean;
}

const featuredCreators: Creator[] = [
  {
    id: "1",
    name: "夢幻星球",
    creator: "小夢創作室",
    specialty: "療癒插畫",
    followers: "12.5K",
    works: 86,
    badge: "本週熱門",
    color: "#a78bfa",
  },
  {
    id: "2",
    name: "極簡宇宙",
    creator: "Minimal Studio",
    specialty: "極簡設計",
    followers: "8.9K",
    works: 52,
    badge: "新銳創作者",
    color: "#60a5fa",
  },
  {
    id: "3",
    name: "自然之心",
    creator: "綠野工作室",
    specialty: "自然手作",
    followers: "15.2K",
    works: 41,
    badge: "精選品牌",
    color: "#34d399",
  },
  {
    id: "4",
    name: "賽博星域",
    creator: "Cyber Arts",
    specialty: "未來視覺",
    followers: "10.8K",
    works: 38,
    badge: "人氣上升",
    color: "#f472b6",
  },
];

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
];

function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <Link href={`/creator/${creator.id}`} className="block group">
      <div className="relative rounded-xl overflow-hidden bg-muted aspect-square mb-2">
        <div
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
          style={{
            background: `radial-gradient(circle at center, ${creator.color}40 0%, ${creator.color}10 50%, transparent 100%)`,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="h-20 w-20 rounded-full transition-all duration-500 group-hover:h-24 group-hover:w-24"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${creator.color} 0%, ${creator.color}80 100%)`,
              boxShadow: `0 0 40px ${creator.color}60, inset 0 0 20px ${creator.color}40`,
            }}
          />
        </div>
      </div>
      <div className="px-1">
        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
          {creator.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {creator.creator} · {creator.specialty}
        </p>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" />
            {creator.followers}
          </span>
          <span>{creator.works} 件作品</span>
        </div>
      </div>
    </Link>
  );
}

export function ProductsSidebar() {
  const router = useRouter();
  return (
    <aside className="w-80 shrink-0 space-y-4 sticky top-20 h-fit">
      {/* Featured Creators */}
      <TheCard highlightOnHover={false}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              熱門創作者
            </CardTitle>
            <Link
              href="/explore"
              className="text-xs text-primary hover:text-violet-400 font-medium"
            >
              查看全部
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {featuredCreators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        </CardContent>
      </TheCard>

      {/* Recommended Products Button Section */}
      <TheCard highlightOnHover={false}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            熱門商品
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
                  <Badge className="absolute top-1 left-1 bg-primary text-white text-[9px] px-1.5 py-0 border-0">
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
                <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
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

          <TheButton
            variant="outline-primary"
            fullWidth
            className="w-full flex items-center justify-center"
            onClick={() => router.push("/shop")}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            探索更多推薦
          </TheButton>
        </CardContent>
      </TheCard>

      {/* Featured Banner */}
      {/* <Card className="border-0 overflow-hidden bg-gradient-to-br from-primary/10 via-fuchsia-500/10 to-amber-500/10">
        <div className="p-5">
          <Badge className="bg-primary/20 text-primary border-0 mb-3">
            限時優惠
          </Badge>
          <h3 className="font-bold text-lg text-foreground mb-1">
            新會員享 9 折
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            首次購物輸入優惠碼
          </p>
          <div className="flex items-center justify-between">
            <code className="bg-card px-4 py-2 rounded-lg text-sm font-mono font-bold text-primary">
              WELCOME10
            </code>
            <Button
              size="sm"
              className="bg-primary hover:bg-violet-600 text-white"
            >
              立即使用
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </Card> */}
    </aside>
  );
}
