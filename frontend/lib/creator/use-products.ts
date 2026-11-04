"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "@/lib/api";

type CreatorProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  status: "active" | "inactive";
};
type ProductPage = {
  data: CreatorProduct[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
};

export function useCreatorProducts(userId: string | null) {
  const [navigation, setNavigation] = useState({ owner: userId, page: 1 });
  const page = navigation.owner === userId ? navigation.page : 1;
  const [reload, setReload] = useState(0);
  const [state, setState] = useState<{
    owner: string | null; page: number; reload: number;
    result: ProductPage | null; error: string; loading: boolean;
  }>({ owner: null, page: 1, reload: 0, result: null, error: "", loading: true });

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    const identity = { owner: userId, page, reload };
    setState({ ...identity, result: null, error: "", loading: true });
    void api.get<ProductPage>("/api/v1/me/products", {
      params: { page, per_page: 20 }, signal: controller.signal, timeout: 15000,
    }).then(({ data }) => {
      if (!controller.signal.aborted) setState({ ...identity, result: data, error: "", loading: false });
    }).catch(error => {
      if (controller.signal.aborted) return;
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const message = status === 401 || status === 419 ? "登入已過期，請重新登入。"
        : status === 403 ? "此帳號尚未取得創作者權限或尚未綁定創作者資料。"
        : "商品載入失敗，請稍後重試。";
      setState({ ...identity, result: null, error: message, loading: false });
    });
    return () => controller.abort();
  }, [userId, page, reload]);

  const current = userId !== null && state.owner === userId && state.page === page && state.reload === reload;
  return {
    products: current ? state.result?.data ?? [] : [],
    total: current ? state.result?.meta.total ?? null : null,
    lastPage: current ? state.result?.meta.last_page ?? 1 : 1,
    loading: !current || state.loading,
    error: current ? state.error : "",
    page,
    setPage: (next: number) => setNavigation({ owner: userId, page: next }),
    refresh: () => setReload(value => value + 1),
  };
}
