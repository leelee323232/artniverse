"use client";

import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { UniverseBackground } from "@/components/universe-background";

import { FollowedCreatorsList } from "@/components/followed-creators";

import { FavoriteProductsList } from "@/components/favorite-products";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import { Users, Package, Search } from "lucide-react";
import Link from "next/link";

export default function FavoritesPage() {
  const { user, isLoading } = useAuth();
  if (isLoading || !user) return <div className="relative min-h-screen">
    <UniverseBackground /><Navigation />
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 pt-16">
      <Card className="border-border/50 bg-card/30 p-8 backdrop-blur-md text-center">
        <p className="mb-4 text-foreground">{isLoading ? "確認登入中…" : "請先登入以查看收藏名單"}</p>
        {!isLoading && <Button asChild className="bg-gradient-to-r from-primary to-secondary"><Link href="/login/">前往登入</Link></Button>}
      </Card>
    </div>
  </div>;
  return <MemberFavoritesPage key={user.id} />;
}

function MemberFavoritesPage() {
  const [totalFollowing, setTotalFollowing] = useState<number | null>(null);
  const [totalFavorites, setTotalFavorites] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const query = searchQuery.trim();
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
                    {totalFollowing ?? "—"}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="products" className="gap-2">
                  <Package className="h-4 w-4" />
                  商品
                  <span className="ml-1 text-xs text-muted-foreground">
                    {totalFavorites ?? "—"}
                  </span>
                </TabsTrigger>
              </TabsList>

              {/* Search */}
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜尋收藏..."
                  maxLength={100}
                  className="h-11 border-border/50 bg-card/50 pl-10 backdrop-blur-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Creators Tab */}
            <TabsContent value="creators">
              <FollowedCreatorsList key={query} search={searchQuery.trim()} onTotal={setTotalFollowing} />

            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products">
              <FavoriteProductsList key={query} search={searchQuery.trim()} onTotal={setTotalFavorites} />

            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
