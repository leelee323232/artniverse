"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace("/login/");
    else if (user.is_admin !== true) router.replace("/");
  }, [isLoading, user, router]);

  // Do not mount child pages (or start their requests) before authorization.
  if (isLoading || !user || user.is_admin !== true) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status">
        {isLoading ? "確認管理員權限中…" : "正在離開管理後台…"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar
        open={sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
      />

      <div className="md:pl-64">
        <AdminTopbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
