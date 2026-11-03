"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { FAVORITES_CHANGED, favoriteError, fetchFavoriteProducts, type FavoriteProducts } from "@/lib/commerce/favorites-api";

export function FavoriteProductsList({ search, onTotal }: { search: string; onTotal: (total: number | null) => void }) {
  const { user } = useAuth();
  const [result, setResult] = useState<FavoriteProducts | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const refresh = () => setReload(value => value + 1);
    const changed = (event: Event) => {
      if ((event as CustomEvent<{ userId: string }>).detail.userId === user?.id) refresh();
    };
    window.addEventListener("focus", refresh); window.addEventListener(FAVORITES_CHANGED, changed);
    return () => { window.removeEventListener("focus", refresh); window.removeEventListener(FAVORITES_CHANGED, changed); };
  }, [user?.id]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setResult(null); setError(""); onTotal(null);
    if (!user) return () => controller.abort();
    const timer = setTimeout(() => {
      void fetchFavoriteProducts(search, page, controller.signal).then(data => {
        if (controller.signal.aborted) return;
        if (page > data.meta.last_page) { setPage(Math.max(1, data.meta.last_page)); return; }
        setResult(data); onTotal(data.meta.totalFavorites);
      }).catch(err => { if (!controller.signal.aborted) setError(favoriteError(err)); })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [user?.id, search, page, reload, onTotal]);
  return <div className="space-y-4">
    {loading && <p role="status" className="text-muted-foreground">載入收藏商品中…</p>}
    {error && <div role="alert" className="space-y-2"><p className="text-destructive">{error}</p><Button variant="outline" onClick={() => setReload(value => value + 1)}>重新載入</Button></div>}
    {result && result.data.length === 0 && <div className="rounded-xl border border-border/50 bg-card/30 p-12 text-center">
      <p className="mb-4 text-muted-foreground">{search ? "找不到符合條件的收藏商品" : "您尚未收藏任何上架商品"}</p>
      <Button asChild className="bg-gradient-to-r from-primary to-secondary"><Link href="/shop/">逛逛商品</Link></Button>
    </div>}
    {result && result.data.length > 0 && <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {result.data.map(product => <ProductCard key={product.id} source="api" id={product.id} name={product.name}
        price={product.price} image={product.images[0] ?? ""} category={product.category} stock={product.stock} creatorId={product.creatorId ?? ""} />)}
    </div>}
    {result && result.meta.last_page > 1 && <div className="flex items-center justify-center gap-4">
      <Button variant="outline" disabled={loading || page <= 1} onClick={() => setPage(value => value - 1)}>上一頁</Button>
      <span>第 {result.meta.current_page} / {result.meta.last_page} 頁</span>
      <Button variant="outline" disabled={loading || page >= result.meta.last_page} onClick={() => setPage(value => value + 1)}>下一頁</Button>
    </div>}
  </div>;
}
