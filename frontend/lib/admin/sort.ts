import type { AdminBaseEntity } from "@/types/admin";

// 依 sortOrder 由小到大排序
export function sortBySortOrder<T extends AdminBaseEntity>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

// 重新整理 sortOrder，使其從 1 開始連續編號
export function normalizeSortOrder<T extends AdminBaseEntity>(items: T[]): T[] {
  return sortBySortOrder(items).map((item, index) => ({
    ...item,
    sortOrder: index + 1,
  }));
}

// 上移：將指定 id 與前一筆交換順序
export function moveUp<T extends AdminBaseEntity>(items: T[], id: string): T[] {
  const sorted = sortBySortOrder(items);
  const index = sorted.findIndex((item) => item.id === id);
  if (index <= 0) return sorted;

  const next = [...sorted];
  [next[index - 1], next[index]] = [next[index], next[index - 1]];
  return normalizeSortOrder(next);
}

// 下移：將指定 id 與後一筆交換順序
export function moveDown<T extends AdminBaseEntity>(items: T[], id: string): T[] {
  const sorted = sortBySortOrder(items);
  const index = sorted.findIndex((item) => item.id === id);
  if (index === -1 || index >= sorted.length - 1) return sorted;

  const next = [...sorted];
  [next[index + 1], next[index]] = [next[index], next[index + 1]];
  return normalizeSortOrder(next);
}
