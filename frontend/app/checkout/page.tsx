"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ApiCheckout } from "@/components/checkout/api-checkout";

function Entry() {
  const params = useSearchParams();
  return params.get("source") === "api" ? <ApiCheckout draftId={params.get("draft") ?? ""} /> : <div className="space-y-4"><p>舊的示範結帳已停用，請從購物車重新選擇商品。</p><Link href="/cart" className="underline">返回購物車</Link></div>;
}
export default function CheckoutPage() { return <Suspense fallback={<p>載入結帳資料中…</p>}><Entry /></Suspense>; }
