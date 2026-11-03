"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2, RotateCcw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { FAVORITES_CHANGED, favoriteError, fetchFavoriteState, setProductFavorite, type ProductFavorite } from "@/lib/commerce/favorites-api";

type Props = { productId: string; className?: string; large?: boolean };
export function ProductFavoriteButton(props: Props) {
  const { user, isLoading } = useAuth();
  return <MemberHeart key={(user?.id ?? "guest") + ":" + props.productId} {...props} userId={user?.id ?? null} authLoading={isLoading} />;
}

function MemberHeart({ productId, className, large, userId, authLoading }: Props & { userId: string | null; authLoading: boolean }) {
  const router = useRouter(); const { toast } = useToast();
  const [state, setState] = useState<ProductFavorite | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const busy = useRef(false);
  const mutation = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const valid = /^[1-9]\d*$/.test(productId);
  useEffect(() => () => mutation.current?.abort(), []);
  useEffect(() => {
    if (!userId || authLoading || !valid) return;
    let active = true; const current = ++generation.current;
    setLoading(true); setState(null); setError("");
    void fetchFavoriteState(userId, productId).then(data => {
      if (active && current === generation.current) setState(data);
    }).catch(err => { if (active && current === generation.current) setError(favoriteError(err)); })
      .finally(() => { if (active && current === generation.current) setLoading(false); });
    return () => { active = false; };
  }, [userId, authLoading, productId, valid, reload]);
  useEffect(() => {
    const refresh = () => { if (!busy.current) setReload(value => value + 1); };
    const changed = (event: Event) => {
      const detail = (event as CustomEvent<{ userId: string; state?: ProductFavorite }>).detail;
      if (detail.userId !== userId) return;
      if (!detail.state) { refresh(); return; }
      if (detail.state.productId === productId) {
        ++generation.current; setState(detail.state); setLoading(false); setError("");
      }
    };
    window.addEventListener("focus", refresh); window.addEventListener(FAVORITES_CHANGED, changed);
    return () => { window.removeEventListener("focus", refresh); window.removeEventListener(FAVORITES_CHANGED, changed); };
  }, [userId, productId]);

  const toggle = async () => {
    if (!userId) { router.push("/login/"); return; }
    if (busy.current) return;
    if (error || !state) { setReload(value => value + 1); return; }
    if (!state.canFavorite && !state.isFavorited) return;
    const controller = new AbortController(); mutation.current = controller;
    busy.current = true; setSaving(true);
    try {
      const data = await setProductFavorite(productId, !state.isFavorited, controller.signal);
      if (controller.signal.aborted) return;
      setState(data);
      window.dispatchEvent(new CustomEvent(FAVORITES_CHANGED, { detail: { userId, state: data } }));
      toast({ title: data.isFavorited ? "已加入收藏" : "已取消收藏" });
    } catch (err) {
      if (controller.signal.aborted) return;
      setState(null); setError(favoriteError(err));
      toast({ title: "收藏結果待確認", description: favoriteError(err) + " 請點愛心位置的重試按鈕重新查詢。", variant: "destructive" });
      window.dispatchEvent(new CustomEvent(FAVORITES_CHANGED, { detail: { userId } }));
    } finally { busy.current = false; if (!controller.signal.aborted) setSaving(false); }
  };
  const label = error ? "重新查詢收藏狀態" : saving ? "處理中…" : userId && loading ? "載入收藏狀態…" : state?.isFavorited ? "取消收藏" : state && !state.canFavorite ? "商品目前無法收藏" : "加入收藏";
  const size = large ? "h-5 w-5" : "h-4 w-4";
  return <button type="button" className={className} title={error || label} aria-label={label} aria-pressed={state?.isFavorited ?? false}
    disabled={!valid || authLoading || saving || (!!userId && loading) || (!!state && !state.canFavorite && !state.isFavorited)}
    onClick={event => { event.preventDefault(); event.stopPropagation(); void toggle(); }}>
    {authLoading || saving || (userId && loading) ? <Loader2 className={size + " animate-spin"} /> : error ? <RotateCcw className={size} /> : <Heart className={size + (state?.isFavorited ? " fill-red-500 text-red-500" : " text-foreground")} />}
  </button>;
}
