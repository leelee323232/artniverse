"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AdminBaseEntity } from "@/types/admin";
import {
  moveDown as moveDownUtil,
  moveUp as moveUpUtil,
  normalizeSortOrder,
  sortBySortOrder,
} from "@/lib/admin/sort";

type CreatePayload<T extends AdminBaseEntity> = Omit<T, "id" | "createdAt">;

interface UseAdminCrudResult<T extends AdminBaseEntity> {
  items: T[];
  loading: boolean;
  error: string;
  isModalOpen: boolean;
  editingItem: T | null;
  reload: () => Promise<void>;
  openCreate: () => void;
  openEdit: (item: T) => void;
  closeModal: () => void;
  // 有 editingItem 時為更新，否則為新增
  submit: (payload: CreatePayload<T>) => Promise<boolean>;
  remove: (id: string) => Promise<void>;
  toggleActive: (item: T) => Promise<void>;
  moveUp: (id: string) => Promise<void>;
  moveDown: (id: string) => Promise<void>;
}

// MVP 階段：以記憶體狀態模擬資料來源（seed 為各功能 mock data）。
// 之後要改接真實 API 時，可把這個 hook 內部的同步操作換成 axios 呼叫，頁面不需更動。
export function useAdminCrud<T extends AdminBaseEntity>(
  idPrefix: string,
  seed: T[],
): UseAdminCrudResult<T> {
  // 用 ref 保存 seed，避免每次 render 重新初始化
  const seedRef = useRef(seed);

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);

  const genId = useCallback(
    () => `${idPrefix}-${Math.random().toString(36).slice(2, 8)}`,
    [idPrefix],
  );

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    // 模擬非同步載入
    await new Promise((resolve) => setTimeout(resolve, 200));
    setItems(sortBySortOrder(seedRef.current).map((item) => ({ ...item })));
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const openCreate = useCallback(() => {
    setEditingItem(null);
    setIsModalOpen(true);
  }, []);

  const openEdit = useCallback((item: T) => {
    setEditingItem(item);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingItem(null);
  }, []);

  const submit = useCallback(
    async (payload: CreatePayload<T>) => {
      setError("");
      if (editingItem) {
        setItems((prev) =>
          sortBySortOrder(
            prev.map((item) =>
              item.id === editingItem.id ? { ...item, ...payload } : item,
            ),
          ),
        );
      } else {
        const created = {
          ...payload,
          id: genId(),
          createdAt: new Date().toISOString().slice(0, 10),
        } as T;
        setItems((prev) => normalizeSortOrder([...prev, created]));
      }
      setIsModalOpen(false);
      setEditingItem(null);
      return true;
    },
    [editingItem, genId],
  );

  const remove = useCallback(async (id: string) => {
    setItems((prev) => normalizeSortOrder(prev.filter((item) => item.id !== id)));
  }, []);

  const toggleActive = useCallback(async (item: T) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === item.id ? { ...it, isActive: !it.isActive } : it,
      ),
    );
  }, []);

  const moveUp = useCallback(async (id: string) => {
    setItems((prev) => moveUpUtil(prev, id));
  }, []);

  const moveDown = useCallback(async (id: string) => {
    setItems((prev) => moveDownUtil(prev, id));
  }, []);

  return useMemo(
    () => ({
      items,
      loading,
      error,
      isModalOpen,
      editingItem,
      reload,
      openCreate,
      openEdit,
      closeModal,
      submit,
      remove,
      toggleActive,
      moveUp,
      moveDown,
    }),
    [
      items,
      loading,
      error,
      isModalOpen,
      editingItem,
      reload,
      openCreate,
      openEdit,
      closeModal,
      submit,
      remove,
      toggleActive,
      moveUp,
      moveDown,
    ],
  );
}
