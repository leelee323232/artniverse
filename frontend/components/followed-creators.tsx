"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreatorFollowGrid } from "@/components/creator-follow-grid";
import { Button } from "@/components/ui/button";
import { creatorFollowError, fetchFollowedCreators, type FollowedCreators } from "@/lib/creator/follow-api";

export function FollowedCreatorsList({ search, onTotal }: { search: string; onTotal: (total: number | null) => void }) {
  const [result, setResult] = useState<FollowedCreators | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const refresh = () => setReload(v => v + 1);
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(""); setResult(null); onTotal(null);
    const timer = setTimeout(() => {
      void fetchFollowedCreators(search, page, controller.signal).then(data => {
        if (controller.signal.aborted) return;
        if (page > data.meta.last_page) { setPage(Math.max(1, data.meta.last_page)); return; }
        setResult(data); onTotal(data.meta.totalFollowing);
      }).catch(err => { if (!controller.signal.aborted) setError(creatorFollowError(err)); })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [search, page, reload, onTotal]);

  return <div className="space-y-4">
    {loading && <p role="status" className="text-muted-foreground">載入追蹤創作者中…</p>}
    {error && <div role="alert" className="space-y-2">
      <p className="text-destructive">{error}</p>
      <Button variant="outline" onClick={() => setReload(v => v + 1)}>重新載入</Button>
    </div>}
    {result && result.data.length === 0 && <div className="rounded-xl border border-border/50 bg-card/30 p-12 text-center">
      <p className="mb-4 text-muted-foreground">{search ? "找不到符合條件的追蹤創作者" : "您尚未追蹤任何公開創作者"}</p>
      <Button asChild className="bg-gradient-to-r from-primary to-secondary"><Link href="/explore/">探索創作者</Link></Button>
    </div>}
    {result && result.data.length > 0 && <CreatorFollowGrid creators={result.data} onUnfollow={() => setReload(v => v + 1)} />}
    {result && result.meta.last_page > 1 && <div className="flex items-center justify-center gap-4">
      <Button variant="outline" disabled={loading || page <= 1} onClick={() => setPage(v => v - 1)}>上一頁</Button>
      <span>第 {result.meta.current_page} / {result.meta.last_page} 頁</span>
      <Button variant="outline" disabled={loading || page >= result.meta.last_page} onClick={() => setPage(v => v + 1)}>下一頁</Button>
    </div>}
  </div>;
}
