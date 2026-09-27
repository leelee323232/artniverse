import type { FeaturedProduct } from "@/types/admin";

export const mockFeaturedProducts: FeaturedProduct[] = [
  { id: "fp-1", productId: "1", sortOrder: 1, isActive: true, createdAt: "2026-01-10" },
  { id: "fp-2", productId: "3", sortOrder: 2, isActive: true, createdAt: "2026-01-10" },
  { id: "fp-3", productId: "2", sortOrder: 3, isActive: false, createdAt: "2026-01-11" },
];
