"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Palette } from "lucide-react";
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
  { href: "/creator-portal", label: "創作者入口" },
];

export function MobileMenu() {
  const router = useRouter();
  const { user } = useAuth();

  const handleCreatorPortal = () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.isCreator) {
      router.push("/creator-portal");
    } else {
      router.push("/creator-apply");
    }
  };

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
        </nav>
      </SheetContent>
    </Sheet>
  );
}
