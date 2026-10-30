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
  Settings,
  DollarSign,
  Truck,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavLeaf {
  type: "leaf";
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface AdminNavGroup {
  type: "group";
  label: string;
  icon: LucideIcon;
  children: AdminNavLeaf[];
}

export type AdminNavEntry = AdminNavLeaf | AdminNavGroup;

export const adminNavEntries: AdminNavEntry[] = [
  { type: "leaf", label: "後台首頁", href: "/admin", icon: LayoutDashboard },
  {
    type: "group",
    label: "商品管理",
    icon: Package,
    children: [
      { type: "leaf", label: "商品清單", href: "/admin/products", icon: Package },
      { type: "leaf", label: "商品開發申請審核", href: "/admin/product-applications", icon: PackagePlus },
      { type: "leaf", label: "商品模板", href: "/admin/product-templates", icon: PanelsTopLeft },
      { type: "leaf", label: "商品類別", href: "/admin/product-categories", icon: Tags },
    ],
  },
  {
    type: "group",
    label: "創作者管理",
    icon: Users,
    children: [
      { type: "leaf", label: "創作者清單", href: "/admin/creators", icon: Users },
      { type: "leaf", label: "創作者申請審核", href: "/admin/creator-applications", icon: ClipboardList },
      { type: "leaf", label: "創作者類別", href: "/admin/creator-categories", icon: FolderTree },
    ],
  },
  {
    type: "group",
    label: "企業委託",
    icon: Scroll,
    children: [
      { type: "leaf", label: "委託需求清單", href: "/admin/quests", icon: ClipboardList },
      { type: "leaf", label: "方案設定", href: "/admin/quests/plans", icon: Settings },
    ],
  },
  {
    type: "group",
    label: "行銷與內容",
    icon: Megaphone,
    children: [
      { type: "leaf", label: "活動區塊", href: "/admin/activities", icon: ImageIcon },
      { type: "leaf", label: "優惠碼", href: "/admin/coupons", icon: Ticket },
      { type: "leaf", label: "貼文管理", href: "/admin/posts", icon: Newspaper },
    ],
  },
  { type: "leaf", label: "分潤管理", href: "/admin/revenue-sharing", icon: DollarSign },
  { type: "leaf", label: "運費設定", href: "/admin/shipping", icon: Truck },
];
