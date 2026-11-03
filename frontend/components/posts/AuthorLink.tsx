import Link from "next/link";
import type { ReactNode } from "react";

export function AuthorLink({ authorId, authorType, children, className, label }: {
  authorId: string;
  authorType?: "official" | "creator";
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  // 舊資料或未登入時不產生錯誤的個人主頁網址。
  if (!authorId || authorId === "artniverse" || authorType === "official") return <span className={className}>{children}</span>;
  const href = authorType === "creator" ? `/creator/?id=${encodeURIComponent(authorId)}` : "/creator/1/";
  return <Link href={href} className={className} aria-label={label}>{children}</Link>;
}
