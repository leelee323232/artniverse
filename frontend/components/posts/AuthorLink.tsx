import Link from "next/link";
import type { ReactNode } from "react";

export function AuthorLink({ authorId, children, className, label }: {
  authorId: string;
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  // 舊資料或未登入時不產生錯誤的個人主頁網址。
  if (!authorId) return <span className={className}>{children}</span>;
  return <Link href={`/creator/${encodeURIComponent(authorId)}`} className={className} aria-label={label}>{children}</Link>;
}
