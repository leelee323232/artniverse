"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ApiPayment } from "@/components/checkout/api-payment";

function Entry() { return <ApiPayment orderId={useSearchParams().get("order") ?? ""} />; }
export default function PaymentPage() { return <Suspense fallback={<p>載入付款資料中…</p>}><Entry /></Suspense>; }
