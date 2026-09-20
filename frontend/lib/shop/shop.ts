import { api } from "@/lib/api"
import type { Page, ProductDetail } from "@/lib/products-api"

export interface Product {
  id: string; image: string; name: string; category: string; categoryId: string;
  productType: string; price: number; stock: number; isNew: boolean; creatorId: string;
  creatorName?: string; currentBackers?: number; targetBackers?: number; daysLeft?: number;
  startingPrice?: number; currentBid?: number; minBidIncrement?: number; hoursLeft?: number;
}

// 相容商品詳情 DTO，避免商店仍期待 image 字串及原始資料庫欄位。
export async function fetchAllProduct(): Promise<Product[]> {
  const products: Product[] = []
  let page = 1
  let lastPage = 1
  do {
    const { data } = await api.get<Page<ProductDetail>>("/api/v1/product", { params: { page } })
    products.push(...data.data.map((item) => ({
      id: item.id, image: item.images[0] ?? "", name: item.name,
      category: item.category, categoryId: item.categoryId,
      productType: "general", price: item.price, stock: item.stock,
      isNew: item.isNew, creatorId: item.creatorId ?? "", creatorName: item.creatorName ?? "",
    })))
    lastPage = data.meta.last_page
    page++
  } while (page <= lastPage)
  return products
}
