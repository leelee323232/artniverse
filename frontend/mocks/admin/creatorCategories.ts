import type { CreatorCategory } from "@/types/admin";

export const mockCreatorCategories: CreatorCategory[] = [
  { id: "cc-1", name: "療癒插畫", sortOrder: 1, isActive: true, createdAt: "2026-01-01" },
  { id: "cc-2", name: "極簡設計", sortOrder: 2, isActive: true, createdAt: "2026-01-01" },
  { id: "cc-3", name: "自然手作", sortOrder: 3, isActive: true, createdAt: "2026-01-02" },
  { id: "cc-4", name: "未來視覺", sortOrder: 4, isActive: false, createdAt: "2026-01-03" },
];
