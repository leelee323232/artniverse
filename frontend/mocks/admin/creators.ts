import type { Creator } from "@/types/admin";

export const mockCreators: Creator[] = [
  {
    id: "c-1",
    name: "小夢創作室",
    avatarUrl: "https://placehold.co/80x80?text=Dream",
    categoryId: "cc-1",
    specialty: "療癒插畫",
    sortOrder: 1,
    isActive: true,
    createdAt: "2026-01-02",
  },
  {
    id: "c-2",
    name: "Minimal Studio",
    avatarUrl: "https://placehold.co/80x80?text=Min",
    categoryId: "cc-2",
    specialty: "極簡設計",
    sortOrder: 2,
    isActive: true,
    createdAt: "2026-01-03",
  },
  {
    id: "c-3",
    name: "綠野工作室",
    avatarUrl: "https://placehold.co/80x80?text=Green",
    categoryId: "cc-3",
    specialty: "自然手作",
    sortOrder: 3,
    isActive: true,
    createdAt: "2026-01-04",
  },
  {
    id: "c-4",
    name: "Cyber Arts",
    avatarUrl: "https://placehold.co/80x80?text=Cyber",
    categoryId: "cc-4",
    specialty: "未來視覺",
    sortOrder: 4,
    isActive: false,
    createdAt: "2026-01-05",
  },
];
