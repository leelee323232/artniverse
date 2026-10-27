"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { adminNavEntries, type AdminNavEntry } from "./nav-config";

interface AdminSidebarProps {
  open?: boolean;
  onNavigate?: () => void;
}

export function AdminSidebar({ open = false, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  // 路由改變時重新依目前子頁展開；同一頁仍可自由收合。
  const [expansion, setExpansion] = useState<{
    pathname: string;
    groups: Record<string, boolean>;
  }>({ pathname, groups: {} });

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isGroupActive = (entry: AdminNavEntry) => {
    if (entry.type !== "group") return false;
    return entry.children.some((child) => isActive(child.href));
  };

  // 預設展開有 active 子項的群組
  const initialOpen = Object.fromEntries(
    adminNavEntries
      .filter((e) => e.type === "group")
      .map((e) => [e.label, isGroupActive(e)]),
  );
  const [openGroups, setOpenGroups] =
    useState<Record<string, boolean>>(initialOpen);

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onNavigate}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 shrink-0 border-r border-border bg-card transition-transform md:translate-x-0 overflow-y-auto",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Link
          href="/admin"
          className="flex h-16 items-center border-b border-border px-6"
        >
          <img
            src="/images/logos/logo_sm_white.png"
            alt="logo"
            height="auto"
            width={60}
          />
          <span className="text-white font-bold text-xl">Dashboard</span>
        </Link>

        <nav className="flex flex-col gap-1 p-3">
          {adminNavEntries.map((entry) => {
            if (entry.type === "leaf") {
              const Icon = entry.icon;
              const active = isActive(entry.href);
              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-primary hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {entry.label}
                </Link>
              );
            }

            // group
            const GroupIcon = entry.icon;
            const groupActive = isGroupActive(entry);
            const expanded = !!openGroups[entry.label];

            return (
              <div key={entry.label}>
                <button
                  type="button"
                  onClick={() => toggleGroup(entry.label)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted",
                    groupActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <GroupIcon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{entry.label}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-200",
                      expanded && "rotate-180",
                    )}
                  />
                </button>

                {expanded && (
                  <div className="ml-3 flex flex-col gap-1 border-l border-border pl-3">
                    {entry.children.map((child) => {
                      const ChildIcon = child.icon;
                      const active = isActive(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onNavigate}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            active
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-primary hover:text-foreground",
                          )}
                        >
                          <ChildIcon className="h-4 w-4 shrink-0" />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
