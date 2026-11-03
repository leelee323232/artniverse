"use client";

import { useState, useEffect } from "react";
import { PostCard } from "@/components/feed/post-card";
import { Loader2 } from "lucide-react";

import { brandPosts } from "@/lib/posts/brand-posts";
import { fetchPosts, postError, type PostPage } from "@/lib/posts/api";
import { Button } from "@/components/ui/button";

export function FeedContent() {
  const [result, setResult] = useState<PostPage | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"following" | "discover">(
    "discover",
  );

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true); setError(""); setResult(null);
    void fetchPosts(page, false, controller.signal).then(data => {
      if (controller.signal.aborted) return;
      if (page > data.meta.last_page) { setPage(Math.max(1, data.meta.last_page)); return; }
      setResult(data);
    }).catch(err => { if (!controller.signal.aborted) setError(postError(err)); })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, [page, reload]);

  const handleTabChange = (tab: "following" | "discover") => {
    setActiveTab(tab);
  };

  return (
    <main className="flex-1 max-w-xl w-full mx-auto">
      {/* Feed Section Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="font-semibold text-lg text-foreground">動態牆</h2>
        <div className="flex gap-2">
          <button
            className={`text-sm px-4 py-1.5 rounded-full transition-colors font-medium ${
              activeTab === "following"
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            onClick={() => handleTabChange("following")}
          >
            追蹤中
          </button>
          <button
            className={`text-sm px-4 py-1.5 rounded-full transition-colors font-medium ${
              activeTab === "discover"
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            onClick={() => handleTabChange("discover")}
          >
            探索
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      {activeTab === "following" && <p className="mb-4 text-sm text-muted-foreground">目前顯示公開動態，追蹤篩選尚未開放。</p>}
      {error && <div role="alert" className="mb-4 space-y-2"><p className="text-destructive">{error}</p><Button variant="outline" onClick={() => setReload(value => value + 1)}>重新載入貼文</Button></div>}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {result?.data.map((post) => (
            <PostCard key={"api-" + post.id} post={post} />
          ))}
        </div>
      )}
      {result && result.meta.last_page > 1 && <div className="my-6 flex items-center justify-center gap-4">
        <Button variant="outline" disabled={isLoading || page <= 1} onClick={() => setPage(value => value - 1)}>上一頁</Button>
        <span>第 {result.meta.current_page} / {result.meta.last_page} 頁</span>
        <Button variant="outline" disabled={isLoading || page >= result.meta.last_page} onClick={() => setPage(value => value + 1)}>下一頁</Button>
      </div>}
      {page === 1 && <section className="mt-6 space-y-4">
        <p className="text-sm text-muted-foreground">品牌展示貼文</p>
        {brandPosts.map(post => <PostCard key={"display-" + post.id} post={post} />)}
      </section>}
    </main>
  );
}
