import {
  LayoutDashboard,
  Package,
  PanelsTopLeft,
  PackagePlus,
  Users,
  Image as ImageIcon,
  Tags,
  FolderTree,
  ClipboardList,
  Ticket,
  Scroll,
  Newspaper,
  Truck,
  Percent,
  type LucideIcon,
} from "lucide-react";

// 一般項目直接導頁；群組只展開子選單，最多兩層。
export interface AdminNavLink {
  label: string;
  href: string;
}

export type AdminNavItem = { label: string; icon: LucideIcon } & (
  | { href: string; children?: never; id?: never }
  | { id: string; children: AdminNavLink[]; href?: never }
);

export const adminNavItems: AdminNavItem[] = [
  { label: "後台首頁", href: "/admin", icon: LayoutDashboard },
  { label: "商品管理", href: "/admin/products", icon: Package },
  {
    label: "商品模板管理",
    href: "/admin/product-templates",
    icon: PanelsTopLeft,
  },
  {
    label: "商品開發申請審核",
    href: "/admin/product-applications",
    icon: PackagePlus,
  },
  { label: "創作者管理", href: "/admin/creators", icon: Users },
  {
    label: "創作者申請審核",
    href: "/admin/creator-applications",
    icon: ClipboardList,
  },
  {
    id: "quests",
    label: "企業委託管理",
    icon: Scroll,
    children: [
      { label: "方案設定", href: "/admin/quests/plans" },
      { label: "委託需求清單", href: "/admin/quests/requests" },
    ],
  },
  { label: "分潤管理", href: "/admin/revenue-sharing", icon: Percent },
  { label: "活動區塊管理", href: "/admin/activities", icon: ImageIcon },
  { label: "商品類別管理", href: "/admin/product-categories", icon: Tags },
  {
    label: "創作者類別管理",
    href: "/admin/creator-categories",
    icon: FolderTree,
  },
  { label: "優惠碼管理", href: "/admin/coupons", icon: Ticket },
  { label: "運費管理", href: "/admin/shipping", icon: Truck },
  { label: "貼文管理", href: "/admin/posts", icon: Newspaper },
];
