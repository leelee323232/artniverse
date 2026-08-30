import { api } from "@/lib/api"

export interface Product {
  id: string
  image: string
  name: string
  category: string
  categoryId: number
  productType: string
  price: number
  stock: number
  isNew: number
  creatorId: string
}

// interface WebProduct {
//   id: number | string
//   image: string
//   name: string
//   category: string
//   price: number
//   stock: number
// }

// function normalizeProduct(webProduct: WebProduct): Product[] {
//   return {
//     id: String(webProduct),
//     image: webProduct.image,
//     name: webProduct.name,
//     category: webProduct.category ?? "",
//     price: webProduct.price,
//     stock: webProduct.stock,
//   }
// }


export async function fetchAllProduct(): Promise<Product[]> {
  const response = await api.get("/api/v1//product")

  return response.data.data
}