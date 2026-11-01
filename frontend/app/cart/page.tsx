"use client";

import { Navigation } from "@/components/navigation";
import { UniverseBackground } from "@/components/universe-background";
import { ApiCart } from "./api-cart";

export default function CartPage() {
  return <div className="relative min-h-screen"><UniverseBackground /><Navigation /><main className="container mx-auto max-w-5xl space-y-5 px-4 pb-20 pt-24"><h1 className="text-3xl font-bold">購物車</h1><p className="text-muted-foreground">請勾選同一創作者的一般商品，前往 TapPay 測試結帳。</p><ApiCart /></main></div>;
}
