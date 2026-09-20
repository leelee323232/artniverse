import type { FeaturedCreator } from "@/types/admin";

export const mockFeaturedCreators: FeaturedCreator[] = [
  { id: "fc-1", creatorId: "c-1", sortOrder: 1, isActive: true, createdAt: "2026-01-10" },
  { id: "fc-2", creatorId: "c-3", sortOrder: 2, isActive: true, createdAt: "2026-01-10" },
  { id: "fc-3", creatorId: "c-2", sortOrder: 3, isActive: false, createdAt: "2026-01-11" },
];
