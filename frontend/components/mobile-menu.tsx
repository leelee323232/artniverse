"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth-context";

const menuLinks = [
  { href: "/", label: "首頁" },
  { href: "/explore", label: "探索宇宙" },
  { href: "/shop", label: "商店" },
  { href: "/events", label: "活動" },
  { href: "/commission", label: "企業委託" },
  { href: "/about", label: "關於我們" },
];

export function MobileMenu() {
  const { user, isLoading } = useAuth();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="開啟選單"
          className="text-muted-foreground hover:text-foreground lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <SheetHeader>
          <SheetTitle>選單</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col px-2">
          {menuLinks.map((link) => (
            <SheetClose asChild key={link.href}>
              <Link
                href={link.href}
                className="rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            </SheetClose>
          ))}
          {!isLoading && <SheetClose asChild>
            <Link
              href={!user ? "/login/" : user.is_creator ? "/creator-portal/" : "/creator-apply/"}
              className="rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {user?.is_creator ? "創作者入口" : "成為創作者"}
            </Link>
          </SheetClose>}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
