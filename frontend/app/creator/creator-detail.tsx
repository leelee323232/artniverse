"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Star, Share2 } from "lucide-react";
import { CreatorFollowButton } from "@/components/creator-follow-button";
import { Navigation } from "@/components/navigation";
import { UniverseBackground } from "@/components/universe-background";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Share } from "@/components/share/share";
import {
  fetchCreatorProfile, fetchCreatorProducts, creatorProfileError, creatorNotFound,
  type CreatorProfile, type CreatorProducts, type CreatorProductSort,
} from "@/lib/creator/profile-api";

export default function CreatorDetail() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  return <CreatorLoader key={id} id={id} />;
}

function CreatorLoader({ id }: { id: string }) {
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [products, setProducts] = useState<CreatorProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [productError, setProductError] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<CreatorProductSort>("default");
  const [reload, setReload] = useState(0);
  const [failedImage, setFailedImage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(""); setProductError(""); setProfile(null); setProducts(null);
    if (!/^[1-9]\d*$/.test(id)) {
      setError("創作者 ID 無效，請從探索頁重新選擇。"); setLoading(false);
      return () => controller.abort();
    }
    void Promise.allSettled([
      fetchCreatorProfile(id, controller.signal),
      fetchCreatorProducts(id, page, sort, controller.signal),
    ]).then(([creatorResult, productResult]) => {
      if (controller.signal.aborted) return;
      if (creatorResult.status === "rejected") {
        setError(creatorProfileError(creatorResult.reason));
      } else if (productResult.status === "rejected" && creatorNotFound(productResult.reason)) {
        // A creator may be taken offline between the two requests; don't retain stale public data.
        setError(creatorProfileError(productResult.reason));
      } else {
        setProfile(creatorResult.value);
        if (productResult.status === "fulfilled") setProducts(productResult.value);
        else setProductError(creatorProfileError(productResult.reason));
      }
      setLoading(false);
    });
    return () => controller.abort();
  }, [id, page, sort, reload]);

  const color = profile && /^#[0-9a-f]{6}$/i.test(profile.color) ? profile.color : "#a78bfa";
  const retry = () => setReload(value => value + 1);

  return <div className="relative min-h-screen">
    <UniverseBackground /><Navigation />
    {loading || !profile ? <main className="container relative z-10 mx-auto space-y-4 px-4 pb-20 pt-24">
      {loading ? <p role="status">載入創作者中…</p> : <><p role="alert">{error}</p><Button variant="outline" onClick={retry}>重新載入</Button></>}
      <Link href="/explore/" className="block underline">返回探索創作者</Link>
    </main> : <>
      <section className="container mx-auto px-4 pt-24 pb-12">
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 p-8 backdrop-blur-sm md:p-12">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full opacity-30 blur-3xl" style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }} />
          <div className="relative z-10 grid gap-8 md:grid-cols-[auto_1fr]">
            <div className="flex justify-center md:justify-start">
              <div className="relative h-32 w-32 overflow-hidden rounded-full md:h-40 md:w-40" style={{ background: `radial-gradient(circle at 30% 30%, ${color} 0%, ${color}80 100%)`, boxShadow: `0 0 60px ${color}60, inset 0 0 30px ${color}40` }}>
                {profile.image && failedImage !== profile.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.image} alt={profile.creator} className="h-full w-full object-cover" onError={() => setFailedImage(profile.image)} />
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div><h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">{profile.name}</h1><p className="text-lg text-muted-foreground">{profile.creator}</p></div>
              <p className="whitespace-pre-wrap break-words text-pretty text-muted-foreground">{profile.description}</p>
              <div className="flex flex-wrap gap-2">{profile.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}</div>
              <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-4 md:grid-cols-3">
                <div><div className="text-2xl font-bold text-foreground">{profile.followers.toLocaleString()}</div><div className="text-sm text-muted-foreground">追蹤者</div></div>
                {profile.rating > 0 && profile.totalReviews > 0 && <div>
                  <div className="flex items-center gap-1 text-2xl font-bold text-foreground"><Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />{profile.rating}</div>
                  <div className="text-sm text-muted-foreground">{profile.totalReviews} 評價</div>
                </div>}
                {profile.joinedDate && <div className="text-sm text-muted-foreground">加入於 {profile.joinedDate}</div>}
              </div>
              <div className="flex flex-wrap gap-3">
                <CreatorFollowButton creatorId={profile.id} onCount={count => setProfile(current => current ? { ...current, followers: count } : current)} />
                <Share title="分享創作者" subtitle="喜歡這位創作者的作品嗎？點擊下方按鈕分享給身邊的好友吧！"
                  trigger={<Button variant="outline" size="lg" className="bg-transparent"><Share2 className="mr-2 h-4 w-4" />分享</Button>} />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Only implemented public features are rendered; demo posts and payment flows stay in the demo page. */}
      <section className="container relative z-10 mx-auto px-4 pb-20">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="mb-8 grid w-full max-w-md grid-cols-1"><TabsTrigger value="products">商品</TabsTrigger></TabsList>
          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-foreground">所有商品</h2>
              <p className="text-sm text-muted-foreground">{products?.meta.total ?? profile.productCount} 件商品</p>
              <Select value={sort} onValueChange={value => { setSort(value as CreatorProductSort); setPage(1); }}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="default">預設排序</SelectItem><SelectItem value="newest">最新上架</SelectItem><SelectItem value="price_asc">價格由低到高</SelectItem><SelectItem value="price_desc">價格由高到低</SelectItem></SelectContent>
              </Select>
            </div>
            {productError && <div role="alert" className="space-y-3"><p>{productError}</p><Button variant="outline" onClick={retry}>重新載入商品</Button></div>}
            {products && products.data.length === 0 && <p className="rounded-xl border border-border/50 bg-card/30 p-8 text-center text-muted-foreground">{products.meta.total === 0 ? "目前沒有已上架的一般商品。" : "此頁已無商品，請返回上一頁。"}</p>}
            {products && <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.data.map(product => <ProductCard key={product.id} {...product} source="api" creatorId={profile.id} />)}
            </div>}
            {products && (products.meta.last_page > 1 || page > 1) && <div className="flex items-center justify-center gap-4">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>上一頁</Button>
              <span>第 {products.meta.current_page} / {products.meta.last_page} 頁</span>
              <Button variant="outline" disabled={page >= products.meta.last_page} onClick={() => setPage(value => value + 1)}>下一頁</Button>
            </div>}
          </TabsContent>
        </Tabs>
      </section>
    </>}
  </div>;
}
