import {
  LayoutDashboard,
  Package,
  Users,
  Image as ImageIcon,
  Tags,
  FolderTree,
  Star,
  Sparkles,
  ClipboardList,
  Ticket,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const adminNavItems: AdminNavItem[] = [
  { label: "後台首頁", href: "/admin", icon: LayoutDashboard },
  { label: "產品管理", href: "/admin/products", icon: Package },
  { label: "創作者管理", href: "/admin/creators", icon: Users },
  { label: "創作者申請審核", href: "/admin/creator-applications", icon: ClipboardList },
  { label: "活動區塊管理", href: "/admin/activities", icon: ImageIcon },
  { label: "產品類別管理", href: "/admin/product-categories", icon: Tags },
  { label: "創作者類別管理", href: "/admin/creator-categories", icon: FolderTree },
  { label: "熱門創作者", href: "/admin/featured-creators", icon: Star },
  { label: "熱門商品", href: "/admin/featured-products", icon: Sparkles },
  { label: "優惠碼管理", href: "/admin/coupons", icon: Ticket },
];
