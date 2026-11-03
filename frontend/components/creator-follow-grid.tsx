"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import type { ExploreCreator } from "@/lib/explore-api";
import { creatorFollowError, fetchCreatorFollowStatuses, setCreatorFollow, type CreatorFollow } from "@/lib/creator/follow-api";
import { PlanetCard } from "@/components/planet-card";
import { Button } from "@/components/ui/button";

type Props = { creators: ExploreCreator[]; onUnfollow?: () => void };

export function CreatorFollowGrid(props: Props) {
  const { user, isLoading } = useAuth();
  // Never carry another member's state, or a previous page's requests, into this grid.
  return <FollowGrid key={(user?.id ?? "guest") + ":" + props.creators.map(c => c.id).join(",")}
    {...props} member={!!user} authLoading={isLoading} />;
}

function FollowGrid({ creators, onUnfollow, member, authLoading }: Props & { member: boolean; authLoading: boolean }) {
  const router = useRouter();
  const [states, setStates] = useState<Record<string, CreatorFollow>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const busy = useRef(false);
  const mutation = useRef<AbortController | null>(null);
  const onUnfollowRef = useRef(onUnfollow);
  onUnfollowRef.current = onUnfollow;
  const ids = creators.map(c => c.id).join(",");

  useEffect(() => () => mutation.current?.abort(), []);
  useEffect(() => {
    const refresh = () => { if (!busy.current) setReload(v => v + 1); };
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);
  useEffect(() => {
    if (!member || authLoading || !ids) return;
    const controller = new AbortController();
    setLoading(true); setStates({}); setError("");
    void fetchCreatorFollowStatuses(ids.split(","), controller.signal).then(data => {
      if (controller.signal.aborted) return;
      setStates(Object.fromEntries(data.map(row => [row.creatorId, row])));
      // Reconcile the favorites list after a timeout or a change made on another page.
      if (data.some(row => !row.isFollowing || row.followers === null)) onUnfollowRef.current?.();
    }).catch(err => { if (!controller.signal.aborted) setError(creatorFollowError(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [ids, member, authLoading, reload]);

  const toggle = async (id: string) => {
    if (!member) { router.push("/login/"); return; }
    const state = states[id];
    if (busy.current || loading || !state || (!state.canFollow && !state.isFollowing)) return;
    const controller = new AbortController(); mutation.current = controller;
    busy.current = true; setSaving(true); setError("");
    try {
      const data = await setCreatorFollow(id, !state.isFollowing, controller.signal);
      if (controller.signal.aborted) return;
      setStates(previous => ({ ...previous, [id]: data }));
      if (!data.isFollowing) onUnfollow?.();
    } catch (err) {
      if (controller.signal.aborted) return;
      // A timeout may have committed; re-read before allowing another toggle.
      setStates({}); setError(creatorFollowError(err));
    } finally {
      busy.current = false;
      if (!controller.signal.aborted) setSaving(false);
    }
  };

  return <>
    {error && <div role="alert" className="mb-4 space-y-2">
      <p className="text-destructive">{error}</p>
      <Button variant="outline" onClick={() => { if (!busy.current) setReload(v => v + 1); }}>重新查詢追蹤狀態</Button>
    </div>}
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {creators.map(creator => {
        const state = states[creator.id];
        return <PlanetCard key={creator.id} {...creator} image={creator.image ?? ""} showImage
          href={"/creator/?id=" + encodeURIComponent(creator.id)}
          followers={state?.followers ?? creator.followers} isFavorited={state?.isFollowing}
          onToggleFavorite={id => void toggle(id)}
          favoriteDisabled={authLoading || (member && (loading || saving || !state || (!state.canFollow && !state.isFollowing)))} />;
      })}
    </div>
  </>;
}
