"use client";

import Link from "next/link";
import {
  Package,
  Users,
  Image as ImageIcon,
  Star,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { mockProducts } from "@/mocks/admin/products";
import { mockCreators } from "@/mocks/admin/creators";
import { mockActivities } from "@/mocks/admin/activities";
import { mockFeaturedProducts } from "@/mocks/admin/featuredProducts";
import { mockFeaturedCreators } from "@/mocks/admin/featuredCreators";

interface StatCard {
  label: string;
  count: number;
  href: string;
  icon: LucideIcon;
}

const stats: StatCard[] = [
  { label: "產品數量", count: mockProducts.length, href: "/admin/products", icon: Package },
  { label: "創作者數量", count: mockCreators.length, href: "/admin/creators", icon: Users },
  { label: "活動區塊數量", count: mockActivities.length, href: "/admin/activities", icon: ImageIcon },
  { label: "熱門商品數量", count: mockFeaturedProducts.length, href: "/admin/featured-products", icon: Sparkles },
  { label: "熱門創作者數量", count: mockFeaturedCreators.length, href: "/admin/featured-creators", icon: Star },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <AdminPageHeader
        title="後台管理首頁"
        description="歡迎使用藝術宇宙後台，以下為各項資料概況。"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3 text-3xl font-bold text-foreground">
                {stat.count}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
