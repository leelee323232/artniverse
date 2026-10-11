import { Suspense } from "react";
import OrderDetailContent from "./OrderDetailContent";

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <OrderDetailContent />
    </Suspense>
  );
}
