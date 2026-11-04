import { api } from "@/lib/api";

export type PostLike = { postId: string; isLiked: boolean; canLike: boolean; likes: number | null };
type Pending = { id: string; resolve: (value: PostLike) => void; reject: (error: unknown) => void };
const queues = new Map<string, Pending[]>();

// Combine hearts mounted together into batches; never cache another member's state.
export function fetchPostLike(userId: string, id: string): Promise<PostLike> {
  return new Promise((resolve, reject) => {
    const existing = queues.get(userId);
    if (existing) { existing.push({ id, resolve, reject }); return; }
    const queue: Pending[] = [{ id, resolve, reject }]; queues.set(userId, queue);
    setTimeout(() => {
      queues.delete(userId);
      const ids = [...new Set(queue.map(item => item.id))];
      for (let start = 0; start < ids.length; start += 100) {
        const chunk = ids.slice(start, start + 100);
        const requests = queue.filter(item => chunk.includes(item.id));
        const params = new URLSearchParams(); chunk.forEach(id => params.append("post_ids[]", id));
        void api.get<{ data: PostLike[] }>("/api/v1/posts/like-statuses", { params, timeout: 15000 })
          .then(response => requests.forEach(item => {
            const state = response.data.data.find(row => row.postId === item.id);
            if (state) item.resolve(state); else item.reject(new Error("Missing like state"));
          })).catch(error => requests.forEach(item => item.reject(error)));
      }
    }, 20);
  });
}

export async function setPostLike(id: string, liked: boolean, signal: AbortSignal) {
  await api.get("/sanctum/csrf-cookie", { signal, timeout: 15000 });
  const url = `/api/v1/posts/${encodeURIComponent(id)}/like`;
  return (liked
    ? await api.put<{ data: PostLike }>(url, {}, { signal, timeout: 15000 })
    : await api.delete<{ data: PostLike }>(url, { signal, timeout: 15000 })).data.data;
}
