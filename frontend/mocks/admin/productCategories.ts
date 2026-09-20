import type { ProductCategory } from "@/types/admin";

export const mockProductCategories: ProductCategory[] = [
  { id: "pc-1", name: "戶外用品", sortOrder: 1, isActive: true, createdAt: "2026-01-01" },
  { id: "pc-2", name: "客廳", sortOrder: 2, isActive: true, createdAt: "2026-01-01" },
  { id: "pc-3", name: "廚房", sortOrder: 3, isActive: true, createdAt: "2026-01-02" },
  { id: "pc-4", name: "臥室", sortOrder: 4, isActive: true, createdAt: "2026-01-02" },
  { id: "pc-5", name: "車用", sortOrder: 5, isActive: false, createdAt: "2026-01-03" },
];
