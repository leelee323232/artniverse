"use client";

import { useMemo, useState } from "react";
import { Navigation } from "@/components/navigation";
import { UniverseBackground } from "@/components/universe-background";
import { PlanetCard } from "@/components/planet-card";
import { ProductCard } from "@/components/product-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import { Heart, Users, Package, Search } from "lucide-react";
import Link from "next/link";

interface FavoriteCreator {
  id: string;
  name: string;
  creator: string;
  description: string;
  tags: string[];
  followers: number;
  rating: number;
  image: string;
  color: string;
}

interface FavoriteProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  creatorId: string;
}

const mockFavoriteCreators: FavoriteCreator[] = [
  {
    id: "1",
    name: "夢幻星球",
    creator: "小夢創作室",
    description: "專注於療癒系插畫與周邊商品設計，帶給你溫暖的視覺體驗",
    tags: ["療癒", "可愛", "插畫"],
    followers: 12500,
    rating: 4.9,
    image: "/placeholder.svg?height=300&width=300",
    color: "#a78bfa",
  },
  {
    id: "3",
    name: "自然之心",
    creator: "綠野工作室",
    description: "從大自然汲取靈感，創造與環境共生的藝術作品",
    tags: ["自然", "環保", "手作"],
    followers: 15200,
    rating: 5.0,
    image: "/placeholder.svg?height=300&width=300",
    color: "#34d399",
  },
  {
    id: "6",
    name: "夢境實驗室",
    creator: "Dream Lab",
    description: "超現實主義的視覺探索，打破想像的邊界",
    tags: ["夢幻", "超現實", "藝術"],
    followers: 11400,
    rating: 4.9,
    image: "/placeholder.svg?height=300&width=300",
    color: "#c084fc",
  },
];

const mockFavoriteProducts: FavoriteProduct[] = [
  {
    id: "1",
    name: "星空露營燈",
    price: 1280,
    image: "/cute-notebook-with-stars.jpg",
    category: "戶外用品",
    stock: 45,
    creatorId: "1",
  },
  {
    id: "2",
    name: "月光明信片組",
    price: 320,
    image: "/placeholder.svg?height=300&width=300",
    category: "文具",
    stock: 8,
    creatorId: "2",
  },
  {
    id: "3",
    name: "森林療癒海報",
    price: 580,
    image: "/placeholder.svg?height=300&width=300",
    category: "掛畫",
    stock: 20,
    creatorId: "3",
  },
  {
    id: "4",
    name: "夢幻星球貼紙組",
    price: 150,
    image: "/placeholder.svg?height=300&width=300",
    category: "貼紙",
    stock: 5,
    creatorId: "1",
  },
];

export default function FavoritesPage() {
  const { user } = useAuth();
  const [creators, setCreators] =
    useState<FavoriteCreator[]>(mockFavoriteCreators);
  const [products, setProducts] =
    useState<FavoriteProduct[]>(mockFavoriteProducts);
  const [searchQuery, setSearchQuery] = useState("");

  const removeCreator = (id: string) => {
    setCreators((prev) => prev.filter((c) => c.id !== id));
  };

  const removeProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const query = searchQuery.trim().toLowerCase();

  const filteredCreators = useMemo(
    () =>
      creators.filter((c) => {
        if (!query) return true;
        return (
          c.name.toLowerCase().includes(query) ||
          c.creator.toLowerCase().includes(query) ||
          c.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }),
    [creators, query],
  );

  const filteredProducts = useMemo(
    () =>
      products.filter((p) => {
        if (!query) return true;
        return (
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        );
      }),
    [products, query],
  );

  if (!user) {
    return (
      <div className="relative min-h-screen">
        <UniverseBackground />
        <Navigation />
        <div className="container mx-auto flex min-h-screen items-center justify-center px-4 pt-16">
          <Card className="border-border/50 bg-card/30 p-8 backdrop-blur-md text-center">
            <p className="mb-4 text-foreground">請先登入以查看收藏名單</p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-primary to-secondary">
                前往登入
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">我的收藏</h1>
          </div>

          <Tabs defaultValue="creators" className="w-full">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <TabsList className="bg-card/50 backdrop-blur-sm">
                <TabsTrigger value="creators" className="gap-2">
                  <Users className="h-4 w-4" />
                  創作者
                  <span className="ml-1 text-xs text-muted-foreground">
                    {creators.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="products" className="gap-2">
                  <Package className="h-4 w-4" />
                  商品
                  <span className="ml-1 text-xs text-muted-foreground">
                    {products.length}
                  </span>
                </TabsTrigger>
              </TabsList>

              {/* Search */}
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜尋收藏..."
                  className="h-11 border-border/50 bg-card/50 pl-10 backdrop-blur-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Creators Tab */}
            <TabsContent value="creators">
              {creators.length === 0 ? (
                <EmptyState
                  message="您尚未收藏任何創作者"
                  actionHref="/explore"
                  actionLabel="探索創作者"
                />
              ) : filteredCreators.length === 0 ? (
                <NoResults onClear={() => setSearchQuery("")} />
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredCreators.map((creator) => (
                    <PlanetCard
                      key={creator.id}
                      {...creator}
                      isFavorited
                      onToggleFavorite={removeCreator}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products">
              {products.length === 0 ? (
                <EmptyState
                  message="您尚未收藏任何商品"
                  actionHref="/shop"
                  actionLabel="逛逛商品"
                />
              ) : filteredProducts.length === 0 ? (
                <NoResults onClear={() => setSearchQuery("")} />
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      {...product}
                      isFavorited
                      onToggleFavorite={removeProduct}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  message,
  actionHref,
  actionLabel,
}: {
  message: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <Card className="border-border/50 bg-card/30 p-12 backdrop-blur-md text-center">
      <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
      <p className="mb-4 text-muted-foreground">{message}</p>
      <Link href={actionHref}>
        <Button className="bg-gradient-to-r from-primary to-secondary">
          {actionLabel}
        </Button>
      </Link>
    </Card>
  );
}

function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <Card className="border-border/50 bg-card/30 p-12 backdrop-blur-md text-center">
      <p className="mb-4 text-muted-foreground">找不到符合條件的收藏</p>
      <Button variant="outline" className="bg-transparent" onClick={onClear}>
        清除搜尋
      </Button>
    </Card>
  );
}
