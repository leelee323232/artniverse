"use client";

import { useEffect, useState } from "react";
import { fetchHomeRecommendations, type HomeRecommendations, type RecommendedCreator } from "@/lib/home-recommendations-api";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Users } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TheButton } from "@/components/common/TheButton";
import { useRouter } from "next/navigation";
import { TheCard } from "@/components/common/TheCard";

function CreatorCard({ creator }: { creator: RecommendedCreator }) {
  return (
    <Link href={`/creator/?id=${encodeURIComponent(creator.id)}`} className="block group">
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
          {creator.creator}{creator.tags.length > 0 && ` · ${creator.tags.join("、")}`}
        </p>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" />
            {creator.followers.toLocaleString("zh-TW")}
          </span>
          <span>{creator.productCount} 件商品</span>
        </div>
      </div>
    </Link>
  );
}

export function ProductsSidebar({
  layout = "vertical",
}: {
  layout?: "vertical" | "horizontal";
}) {
  const router = useRouter();
  const [result, setResult] = useState<HomeRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setResult(null);
    void fetchHomeRecommendations(controller.signal)
      .then(data => { if (!controller.signal.aborted) setResult(data); })
      .catch(() => { if (!controller.signal.aborted) setError("推薦資料載入失敗，請稍後重試。"); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reload]);

  const featuredCreators = result?.data.creators ?? [];
  const recommendedProducts = result?.data.products ?? [];
  const status = (count: number, emptyMessage: string) => loading
    ? <p role="status" className="py-3 text-sm text-muted-foreground">載入中…</p>
    : error
      ? <div role="alert" className="space-y-2 py-3 text-sm text-muted-foreground">
          <p>{error}</p>
          <button type="button" className="text-primary hover:underline" onClick={() => setReload(value => value + 1)}>重新載入</button>
        </div>
      : count === 0 ? <p className="py-3 text-sm text-muted-foreground">{emptyMessage}</p> : null;

  if (layout === "horizontal") {
    return (
      <div className="space-y-4">
        {/* Featured Creators */}
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold">熱門創作者</h3>
            <Link
              href="/explore"
              className="text-xs font-medium text-primary hover:text-violet-400"
            >
              查看全部
            </Link>
          </div>
          {status(featuredCreators.length, "目前沒有可推薦的創作者")}
          <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {featuredCreators.map((creator) => (
              <div key={creator.id} className="w-32 shrink-0">
                <CreatorCard creator={creator} />
              </div>
            ))}
          </div>
        </section>

        {/* Recommended Products */}
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold">熱門商品</h3>
            <button
              type="button"
              onClick={() => router.push("/shop")}
              className="text-xs font-medium text-primary hover:text-violet-400"
            >
              探索更多
            </button>
          </div>
          {status(recommendedProducts.length, "目前沒有可推薦的商品")}
          <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {recommendedProducts.map((product) => (
              <Link
                key={product.id}
                href={{ pathname: "/product", query: { id: product.id } }}
                className="group w-40 shrink-0"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {product.isNew && (
                    <Badge className="absolute left-1 top-1 border-0 bg-primary px-1.5 py-0 text-[9px] text-white">
                      NEW
                    </Badge>
                  )}
                  {product.isSale && (
                    <Badge className="absolute left-1 top-1 border-0 bg-rose-500 px-1.5 py-0 text-[9px] text-white">
                      SALE
                    </Badge>
                  )}
                </div>
                <p className="mt-2 truncate text-sm font-medium transition-colors group-hover:text-primary">
                  {product.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {product.creator}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-bold">NT${product.price}</span>
                  {product.isSale && product.originalPrice != null && (
                    <span className="text-xs text-muted-foreground line-through">
                      NT${product.originalPrice}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <aside className="w-80 shrink-0 space-y-4">
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
          {status(featuredCreators.length, "目前沒有可推薦的創作者")}
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
          {status(recommendedProducts.length, "目前沒有可推薦的商品")}
          {recommendedProducts.map((product) => (
            <Link
              key={product.id}
              href={{ pathname: "/product", query: { id: product.id } }}
              className="flex gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors group"
            >
              <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-muted">
                <Image
                  src={product.image || "/placeholder.svg"}
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
                  {product.isSale && product.originalPrice != null && (
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
