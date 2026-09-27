import { Suspense } from "react"
import ProductDetailPage from "./product-detail"

export default function ProductPage() {
  return (
    <Suspense fallback={<main className="container mx-auto px-4 pt-24">商品載入中…</main>}>
      <ProductDetailPage />
    </Suspense>
  )
}
