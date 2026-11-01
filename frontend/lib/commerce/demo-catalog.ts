import { mockProducts } from "@/mocks/admin/products";
import { mockProductCategories } from "@/mocks/admin/productCategories";
import { normalizeCatalog, type CatalogProduct } from "./catalog-api";
import details from "@/mocks/admin/demo-product-details.json";

// Separate identities prevent demo links from opening an unrelated database product.
export function demoCatalog(): CatalogProduct[] {
  return mockProducts.filter(p => p.isActive && p.productType !== "general").map(p => normalizeCatalog({
    ...details.find(d => d.id === p.id), ...p, id: `demo-${p.productType}-${p.id}`,
    category: mockProductCategories.find(c => c.id === p.categoryId)?.name ?? "商品",
    catalog_meta: { isDemo: true },
  }));
}
