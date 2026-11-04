"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { postError } from "@/lib/posts/api";
import { fetchPostLike, setPostLike, type PostLike } from "@/lib/posts/likes-api";

type Props = { postId: string; likes: number; source: "api" | "demo" };
export function PostLikeAction(props: Props) {
  const { user, isLoading } = useAuth();
  return <MemberLike key={(user?.id ?? "guest") + ":" + props.source + ":" + props.postId}
    {...props} userId={user?.id ?? null} authLoading={isLoading} />;
}

function MemberLike({ postId, likes, source, userId, authLoading }: Props & { userId: string | null; authLoading: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<PostLike | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const busy = useRef(false);
  const mutation = useRef<AbortController | null>(null);
  const demo = source === "demo";
  useEffect(() => () => mutation.current?.abort(), []);
  useEffect(() => {
    if (!userId || authLoading || demo) return;
    let active = true;
    setLoading(true); setError(""); setState(null);
    void fetchPostLike(userId, postId).then(data => { if (active) setState(data); })
      .catch(err => { if (active) setError(postError(err)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId, authLoading, demo, postId, reload]);
  useEffect(() => {
    const refresh = () => { if (!busy.current) setReload(value => value + 1); };
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const toggle = async () => {
    if (demo || busy.current) return;
    if (!userId) { router.push("/login/"); return; }
    if (loading || !state || (!state.canLike && !state.isLiked)) return;
    const controller = new AbortController(); mutation.current = controller;
    busy.current = true; setSaving(true); setError("");
    try {
      const data = await setPostLike(postId, !state.isLiked, controller.signal);
      if (!controller.signal.aborted) setState(data);
    } catch (err) {
      if (!controller.signal.aborted) {
        setState(null); setError(postError(err) + " 請重新查詢按讚狀態後再操作。");
      }
    } finally { busy.current = false; if (!controller.signal.aborted) setSaving(false); }
  };
  const checking = !demo && (authLoading || (!!userId && loading));
  const label = demo ? "展示貼文不提供按讚" : checking ? "載入按讚狀態" : saving ? "處理中" : state?.isLiked ? "取消按讚" : state && !state.canLike ? "貼文目前無法按讚" : "按讚";
  const count = state ? state.likes : likes;
  return <div className="w-full space-y-1">
    <Button variant="ghost" size="icon" type="button" aria-label={label} title={label}
      aria-pressed={state?.isLiked ?? false} aria-busy={checking || saving}
      disabled={demo || checking || saving || (!!userId && (!state || (!state.canLike && !state.isLiked)))}
      onClick={() => void toggle()}
      className={"-ml-2 h-10 w-10 transition-transform active:scale-90 motion-reduce:transform-none " + (state?.isLiked ? "text-red-500 hover:text-red-600" : "text-foreground hover:text-red-500")}>
      {checking || saving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Heart className={"h-6 w-6 " + (state?.isLiked ? "fill-current" : "")} />}
    </Button>
    {count !== null && count > 0 && <p aria-live="polite" className="font-semibold text-sm">{count.toLocaleString()} 個讚</p>}
    {error && <div role="alert" className="space-y-1 text-sm">
      <p className="text-destructive">{error}</p>
      <Button variant="outline" size="sm" onClick={() => setReload(value => value + 1)}>重新查詢按讚狀態</Button>
    </div>}
  </div>;
}
