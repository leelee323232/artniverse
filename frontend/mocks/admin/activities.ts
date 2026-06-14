import type { Activity } from "@/types/admin";

export const mockActivities: Activity[] = [
  {
    id: "a-1",
    title: "新會員首購 9 折",
    linkUrl: "/shop",
    imageUrl: "https://placehold.co/320x120?text=Welcome",
    sortOrder: 1,
    isActive: true,
    createdAt: "2026-01-01",
  },
  {
    id: "a-2",
    title: "創作者聯名特展",
    linkUrl: "/explore",
    imageUrl: "https://placehold.co/320x120?text=Exhibition",
    sortOrder: 2,
    isActive: true,
    createdAt: "2026-01-04",
  },
  {
    id: "a-3",
    title: "限時委託創作優惠",
    linkUrl: "/commission",
    imageUrl: "https://placehold.co/320x120?text=Commission",
    sortOrder: 3,
    isActive: false,
    createdAt: "2026-01-08",
  },
];
