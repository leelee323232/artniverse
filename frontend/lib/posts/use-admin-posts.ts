"use client";

import axios from "axios";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { createPost, deletePost, fetchPosts, postCsrf, postError, uploadPostImage, type ApiPost, type NewPost, type PostPage } from "./api";

export function useAdminPosts() {
  const [result, setResult] = useState<PostPage<ApiPost> | null>(null);
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [listError, setListError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImages, setNewPostImages] = useState<File[]>([]);
  const [pending, setPending] = useState<NewPost | null>(null);
  const uploaded = useRef(new Map<File, string>());
  const busy = useRef(false);
  const mutation = useRef<AbortController | null>(null);
  useEffect(() => () => mutation.current?.abort(), []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setListError(""); setResult(null); setAllowed(false);
    void fetchPosts(page, true, controller.signal).then(data => {
      if (controller.signal.aborted) return;
      setAllowed(true);
      if (page > data.meta.last_page) { setPage(Math.max(1, data.meta.last_page)); return; }
      setResult(data);
    }).catch(err => { if (!controller.signal.aborted) setListError(postError(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, reload]);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []); event.target.value = "";
    if (busy.current || pending) return;
    if (newPostImages.length + files.length > 10) { setError("每篇貼文最多 10 張圖片。"); return; }
    if (files.some(file => !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setError("請選擇 JPG、PNG、WebP 或 GIF，每張最多 5 MB。"); return;
    }
    setError(""); setNewPostImages(previous => [...previous, ...files]);
  };
  const handleCreatePost = async () => {
    if (busy.current || !allowed || !newPostContent.trim()) return;
    busy.current = true; setSaving(true); setError(""); setNotice("");
    const controller = new AbortController(); mutation.current = controller;
    let submitted = false;
    try {
      await postCsrf(controller.signal);
      let payload = pending;
      if (!payload) {
        const paths: string[] = [];
        for (const file of newPostImages) {
          let path = uploaded.current.get(file);
          if (!path) { path = await uploadPostImage(file, controller.signal); uploaded.current.set(file, path); }
          paths.push(path);
        }
        payload = { requestKey: crypto.randomUUID(), content: newPostContent.trim(), imagePaths: paths };
        setPending(payload);
      }
      submitted = true;
      await createPost(payload, controller.signal);
      if (controller.signal.aborted) return;
      setPending(null); uploaded.current.clear(); setNewPostContent(""); setNewPostImages([]);
      setIsPostModalOpen(false); setNotice("貼文已發佈。"); setPage(1); setReload(v => v + 1);
    } catch (err) {
      if (controller.signal.aborted) return;
      const definitive = axios.isAxiosError(err) && [409, 422].includes(err.response?.status ?? 0);
      if (definitive) setPending(null);
      setError(postError(err) + (submitted && !definitive ? " 發佈結果尚未確認，請按「重試發佈」確認同一篇貼文，避免重複新增。" : ""));
    } finally {
      busy.current = false;
      if (!controller.signal.aborted) setSaving(false);
    }
  };
  const handleDelete = async (post: ApiPost) => {
    if (busy.current || !allowed || !window.confirm("確定刪除這則貼文？首頁將不再顯示。")) return;
    busy.current = true; setSaving(true); setNotice(""); setError("");
    const controller = new AbortController(); mutation.current = controller;
    try {
      await postCsrf(controller.signal); await deletePost(post, controller.signal);
      if (!controller.signal.aborted) setNotice("貼文已刪除。");
    } catch (err) {
      if (!controller.signal.aborted) setError(postError(err) + " 已重新查詢清單，請確認刪除結果。");
    } finally {
      busy.current = false;
      if (!controller.signal.aborted) { setSaving(false); setReload(v => v + 1); }
    }
  };
  return { result, page, setPage, loading, allowed, listError, error, notice, saving, pending,
    refresh: () => setReload(v => v + 1),
    isPostModalOpen, setIsPostModalOpen: (open: boolean) => { if (!busy.current) setIsPostModalOpen(open); },
    newPostContent, setNewPostContent, newPostImages, setNewPostImages,
    handleImageUpload, handleCreatePost, handleDelete };
}
