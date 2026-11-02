"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { api } from "@/lib/api";
import { mockProducts } from "@/mocks/admin/products";
import type { Product, ProductOptions } from "@/types/admin";

export type ManagedProduct = Product & { version?: number; isPopular?: boolean; isDemo?: boolean; category?: string };
export type ProductSettings = { categories: { id: string; name: string; isActive: boolean }[]; creators: { id: string; name: string }[] };
type Payload = ProductOptions & { name: string; categoryId: string; creatorId: string; price: number; stock: number; sortOrder: number; isActive: boolean; isPopular: boolean; description: string };
const endpoint = "/api/v1/admin/products";
const demos: ManagedProduct[] = mockProducts.filter(p => p.productType === "general").map(p => ({ ...p, id: `demo-${p.id}`, isDemo: true }));
function message(error: unknown) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401 || status === 419) return "登入已失效，請重新登入後再操作。";
    if (status === 403) return "僅管理員可以管理商品。";
    if (status === 404 || status === 405) return "找不到商品或商品管理 API，請確認後端已部署。";
    if (status === 429) return "操作太頻繁，請稍後再試。";
    const data = error.response?.data;
    if (data?.errors) return Object.values(data.errors).flat().join(" ");
    if (typeof data?.message === "string") return data.message;
  }
  return "無法確認操作結果，請重試原送件或重新載入最新商品。";
}

export function useGeneralProducts() {
  const [items, setItems] = useState<ManagedProduct[]>(demos);
  const [settings, setSettings] = useState<ProductSettings>({ categories: [], creators: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [editingItem, setEditingItem] = useState<ManagedProduct | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const busy = useRef(false);
  const active = useRef(true);
  const pending = useRef<Record<string, unknown> | null>(null);
  const upload = useRef<{ file: File; path: string } | null>(null);
  const detailRequest = useRef<AbortController | null>(null);
  useEffect(() => { active.current = true; return () => { active.current = false; detailRequest.current?.abort(); }; }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setReady(false); setError(""); setItems(demos);
    void Promise.all([
      api.get<{ data: ManagedProduct[]; meta: { last_page: number; total: number } }>(endpoint, { params: { page }, signal: controller.signal, timeout: 15000 }),
      api.get<{ data: ProductSettings }>(`${endpoint}/options`, { signal: controller.signal, timeout: 15000 }),
    ]).then(([list, options]) => {
      if (controller.signal.aborted) return;
      setItems([...list.data.data, ...(page === 1 ? demos : [])]);
      setLastPage(list.data.meta.last_page); setTotal(list.data.meta.total);
      setSettings(options.data.data); setReady(true);
    }).catch(err => { if (!controller.signal.aborted) setError(message(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, reloadKey]);

  const reload = () => { if (!busy.current) setReloadKey(v => v + 1); };
  const reset = () => { pending.current = null; upload.current = null; setFrozen(false); setNeedsRefresh(false); setError(""); };
  const openCreate = () => {
    if (!ready || busy.current) return;
    detailRequest.current?.abort(); reset(); setEditingItem(null); setModalOpen(true);
  };
  const openEdit = async (item: Product) => {
    if (busy.current || !ready) return;
    const demo = demos.find(p => p.id === item.id);
    if (demo) { setError("示範商品僅供查看，不會送入資料庫。"); return; }
    detailRequest.current?.abort();
    const controller = new AbortController(); detailRequest.current = controller;
    setError("");
    try {
      const response = await api.get<{ data: ManagedProduct }>(`${endpoint}/${item.id}`, { signal: controller.signal, timeout: 15000 });
      if (controller.signal.aborted) return;
      reset(); setEditingItem(response.data.data); setModalOpen(true);
    } catch (err) { if (!controller.signal.aborted) setError(message(err)); }
  };
  const closeModal = () => {
    if (busy.current) return;
    if (pending.current && !needsRefresh) { setError("本次送件結果尚未確認，請先重試原送件，避免重複新增。"); return; }
    reset(); setModalOpen(false); reload();
  };
  const save = async (payload: Payload, file: File | null) => {
    if (busy.current || !ready || needsRefresh || editingItem?.isDemo) return;
    busy.current = true; setSaving(true); setFrozen(true); setError("");
    let sent = false;
    try {
      await api.get("/sanctum/csrf-cookie", { timeout: 15000 });
      if (!active.current) return;
      if (!pending.current) {
        if (file && upload.current?.file !== file) {
          const body = new FormData(); body.append("image", file);
          const result = await api.post<{ data: { path: string } }>("/api/v1/images", body, { timeout: 90000 });
          if (!active.current) return;
          upload.current = { file, path: result.data.data.path };
        }
        pending.current = { ...payload, productType: "general",
          ...(file && upload.current ? { imagePath: upload.current.path } : {}),
          ...(editingItem ? { expectedVersion: editingItem.version, expectedStock: editingItem.stock } : { requestKey: crypto.randomUUID() }),
        };
      }
      sent = true;
      if (editingItem) await api.patch(`${endpoint}/${editingItem.id}`, pending.current, { timeout: 30000 });
      else await api.post(endpoint, pending.current, { timeout: 30000 });
      if (!active.current) return;
      reset(); setModalOpen(false); setReloadKey(v => v + 1);
    } catch (err) {
      if (!active.current) return;
      setError(message(err));
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      if (status === 409 || (sent && !!editingItem && status !== 422)) {
        setNeedsRefresh(true);
      } else if ((!sent && !pending.current) || status === 422 || status === 413) {
        pending.current = null; setFrozen(false);
      }
    } finally { busy.current = false; if (active.current) setSaving(false); }
  };
  const mutate = async (item: Product, remove: boolean) => {
    const p = items.find(p => p.id === item.id);
    if (!ready || busy.current || !p || p.isDemo) return;
    if (remove && !window.confirm(`確定封存「${p.name}」？封存後會下架，歷史訂單會保留。`)) return;
    busy.current = true; setSaving(true); setError("");
    try {
      await api.get("/sanctum/csrf-cookie", { timeout: 15000 });
      if (remove) await api.delete(`${endpoint}/${p.id}`, { data: { expectedVersion: p.version }, timeout: 30000 });
      else await api.patch(`${endpoint}/${p.id}`, { isActive: !p.isActive, expectedVersion: p.version }, { timeout: 30000 });
      if (active.current) setReloadKey(v => v + 1);
    } catch (err) { if (active.current) { setError(message(err)); setReady(false); } }
    finally { busy.current = false; if (active.current) setSaving(false); }
  };
  const cancelDetail = () => detailRequest.current?.abort();
  return { items, settings, loading, error, ready, page, setPage, lastPage, total, editingItem, isModalOpen, saving, frozen, needsRefresh, reload, openCreate, openEdit, closeModal, save, mutate, cancelDetail };
}
