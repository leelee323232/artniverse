import axios from "axios";
import { api } from "@/lib/api";
import type { Post } from "./types";

export type PublicPost = Post & { authorType: "official" | "creator" };
export type ApiPost = PublicPost & { version: number; imagePaths: string[] };
export type PostPage<T extends Post = PublicPost> = { data: T[]; meta: { current_page: number; last_page: number; per_page: number; total: number } };
export type NewPost = { requestKey: string; content: string; imagePaths: string[] };

function displayPost<T extends Post>(post: T): T {
  const date = new Date(post.createdAt);
  return { ...post, createdAt: Number.isNaN(date.getTime()) ? post.createdAt : date.toLocaleString("zh-TW", { timeZone: "Asia/Taipei", hour12: false }) };
}

export function fetchPosts(page: number, admin: true, signal: AbortSignal): Promise<PostPage<ApiPost>>;
export function fetchPosts(page: number, admin: false, signal: AbortSignal): Promise<PostPage>;
export async function fetchPosts(page: number, admin: boolean, signal: AbortSignal): Promise<PostPage<PublicPost> | PostPage<ApiPost>> {
  const { data } = await api.get<PostPage<PublicPost> | PostPage<ApiPost>>(admin ? "/api/v1/admin/posts" : "/api/v1/posts", { params: { page, per_page: 20 }, signal, timeout: 15000 });
  return { ...data, data: data.data.map(displayPost) };
}
export async function postCsrf(signal: AbortSignal) {
  await api.get("/sanctum/csrf-cookie", { signal, timeout: 15000 });
}
export async function uploadPostImage(file: File, signal: AbortSignal) {
  const form = new FormData(); form.append("image", file);
  return (await api.post<{ data: { path: string } }>("/api/v1/admin/posts/images", form, { signal, timeout: 60000 })).data.data.path;
}
export async function createPost(payload: NewPost, signal: AbortSignal) {
  return (await api.post<{ data: ApiPost }>("/api/v1/admin/posts", payload, { signal, timeout: 30000 })).data.data;
}
export async function deletePost(post: ApiPost, signal: AbortSignal) {
  await api.delete(`/api/v1/admin/posts/${encodeURIComponent(post.id)}`, { data: { expectedVersion: post.version }, signal, timeout: 15000 });
}
export function postError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401 || status === 419) return "登入已失效，請重新登入後再試。";
    if (status === 403) return "此功能僅限管理員使用。";
    if (status === 429) return "操作太頻繁，請稍後再試；已上傳的圖片會保留供重試。";
    if (status === 404) return "找不到貼文或服務尚未部署，請重新載入。";
    if (status === 422) {
      const errors = error.response?.data?.errors;
      const first = errors && Object.values(errors).flat().find(value => typeof value === "string");
      return typeof first === "string" ? first : (error.response?.data?.message ?? "請檢查貼文內容與圖片。");
    }
    if (status === 409) return error.response?.data?.message ?? "貼文已變更，請重新載入。";
  }
  return "貼文服務暫時無法使用，請稍後重試。";
}
