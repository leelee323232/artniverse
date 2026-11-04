"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";
import { UniverseBackground } from "@/components/universe-background";

import { CreatorFollowGrid } from "@/components/creator-follow-grid";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { fetchExploreCreators, exploreError, type ExploreResult, type CreatorSort } from "@/lib/explore-api";

const categories = [
  "全部",
  "療癒",
  "極簡",
  "自然",
  "科技",
  "復古",
  "夢幻",
  "實驗",
  "水彩",
  "幾何",
];

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");

  const [sort, setSort] = useState<CreatorSort>("rating");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<ExploreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(""); setResult(null);
    const timer = setTimeout(() => {
      void fetchExploreCreators({ search: searchQuery.trim(), tag: selectedCategory === "全部" ? undefined : selectedCategory, sort, page }, controller.signal)
        .then(data => { if (!controller.signal.aborted) setResult(data); })
        .catch(err => { if (!controller.signal.aborted) setError(exploreError(err)); })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [searchQuery, selectedCategory, sort, page, reload]);
  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
            探索創作者宇宙
          </h1>
          <p className="text-lg text-muted-foreground">
            {result ? "發現 " + result.meta.totalCreators + " 個創作星球" : "發現獨特的創作星球"}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4 sticky top-20 z-20 -mx-4 px-4 py-4 bg-[oklch(0.13_0.05_275)]/80 bg-[#1a1535] backdrop-blur-md">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜尋創作者、標籤、簡介..."
                maxLength={100}
                className="h-12 border-border/50 bg-card/50 pl-10 backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              />
            </div>
            <Select value={sort} onValueChange={value => { setSort(value as CreatorSort); setPage(1); }}>
              <SelectTrigger className="w-40 border-border/50 bg-card/50 backdrop-blur-sm">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">評分最高</SelectItem>
                <SelectItem value="followers">追蹤最多</SelectItem>
                <SelectItem value="newest">最新加入</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={category === selectedCategory ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105"
                role="button"
                tabIndex={0}
                aria-pressed={category === selectedCategory}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedCategory(category); setPage(1); } }}
                onClick={() => { setSelectedCategory(category); setPage(1); }}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mb-6 text-center text-sm text-muted-foreground" aria-live="polite">
          {loading ? "載入創作者中…" : result ? "找到 " + result.meta.total + " 個創作者" : "正式創作者資料尚未載入"}

        </div>
        {error && <div role="alert" className="mb-6 text-center">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" className="mt-2" onClick={() => setReload(v => v + 1)}>重新載入</Button>
        </div>}
        {result && result.data.length > 0 && <CreatorFollowGrid creators={result.data} />}
        {!loading && page > 1 && (!result || result.data.length === 0) && <div className="my-4 text-center">
          <Button variant="outline" onClick={() => setPage(1)}>返回第一頁</Button>
        </div>}
        {!loading && result?.meta.total === 0 && <div className="rounded-xl border border-border/50 bg-card/30 p-8 text-center">
          <p>找不到符合條件的正式創作者</p>
          <Button variant="outline" className="mt-4" onClick={() => { setSelectedCategory("全部"); setSearchQuery(""); setPage(1); }}>清除篩選</Button>
        </div>}
        {result && result.meta.last_page > 1 && <div className="my-6 flex justify-center items-center gap-4">
          <Button variant="outline" disabled={loading || page <= 1} onClick={() => setPage(v => v - 1)}>上一頁</Button>
          <span>第 {result.meta.current_page} / {result.meta.last_page} 頁</span>
          <Button variant="outline" disabled={loading || page >= result.meta.last_page} onClick={() => setPage(v => v + 1)}>下一頁</Button>
        </div>}

      </div>
    </div>
  );
}
