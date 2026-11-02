"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { fetchCreatorFollow, setCreatorFollow, creatorFollowError, type CreatorFollow } from "@/lib/creator/follow-api";

const buttonClass = "bg-gradient-to-r from-primary to-secondary";
type Props = { creatorId: string; onCount: (count: number) => void };

export function CreatorFollowButton(props: Props) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Button size="lg" className={buttonClass} disabled><Heart className="mr-2 h-4 w-4" />確認登入中…</Button>;
  if (!user) return <Button asChild size="lg" className={buttonClass}><Link href="/login/"><Heart className="mr-2 h-4 w-4" />追蹤創作者</Link></Button>;
  // Clear the previous member's state immediately when the account changes.
  return <MemberFollowButton key={user.id + ":" + props.creatorId} {...props} />;
}

function MemberFollowButton({ creatorId, onCount }: Props) {
  const [state, setState] = useState<CreatorFollow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const busy = useRef(false);
  const mutation = useRef<AbortController | null>(null);
  const onCountRef = useRef(onCount);
  onCountRef.current = onCount;

  useEffect(() => () => mutation.current?.abort(), []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setState(null); setError("");
    void fetchCreatorFollow(creatorId, controller.signal).then(data => {
      if (controller.signal.aborted) return;
      setState(data);
      if (data.followers !== null) onCountRef.current(data.followers);
    }).catch(err => { if (!controller.signal.aborted) setError(creatorFollowError(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [creatorId, reload]);

  const toggle = async () => {
    if (busy.current || loading || !state || (!state.canFollow && !state.isFollowing)) return;
    const controller = new AbortController(); mutation.current = controller;
    busy.current = true; setSaving(true); setError("");
    try {
      const data = await setCreatorFollow(creatorId, !state.isFollowing, controller.signal);
      if (controller.signal.aborted) return;
      setState(data);
      if (data.followers !== null) onCountRef.current(data.followers);
    } catch (err) {
      if (controller.signal.aborted) return;
      // A timeout may have committed. Require a fresh GET instead of toggling stale state.
      setState(null); setError(creatorFollowError(err));
    } finally {
      busy.current = false;
      if (!controller.signal.aborted) setSaving(false);
    }
  };

  return <div className="space-y-2">
    <Button size="lg" className={buttonClass} onClick={() => void toggle()}
      disabled={loading || saving || !state || (!state.canFollow && !state.isFollowing)}
      aria-pressed={state?.isFollowing ?? false}>
      {loading || saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Heart className={"mr-2 h-4 w-4 " + (state?.isFollowing ? "fill-current" : "")} />}
      {saving ? "處理中…" : loading ? "確認追蹤中…" : state?.isFollowing ? "取消追蹤" : state && !state.canFollow ? "無法追蹤此創作者" : "追蹤創作者"}
    </Button>
    {error && <div role="alert" className="max-w-sm space-y-2 text-sm">
      <p className="text-destructive">{error}</p>
      <Button size="sm" variant="outline" onClick={() => setReload(value => value + 1)}>重新查詢狀態</Button>
      <Link href="/login/" className="ml-3 underline">前往登入</Link>
    </div>}
  </div>;
}
