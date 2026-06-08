"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  ShoppingCart,
  User,
  Settings,
  Package,
  Heart,
  LogOut,
  Palette,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Navigation() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg py-2">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/images/logos/logo_lg.png"
            alt="logo"
            height="auto"
            width={150}
          />
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/explore"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            探索宇宙
          </Link>
          <Link
            href="/shop"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            商店
          </Link>
          <Link
            href="/commission"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            委託創作
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            關於我們
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Link href="/cart">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>

          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-full"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                        <span className="text-sm font-bold text-primary-foreground">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account/profile"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <User className="h-4 w-4" />
                      個人資料
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account/settings"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="h-4 w-4" />
                      設定
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account/orders"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Package className="h-4 w-4" />
                      我的訂單
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account/favorites"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Heart className="h-4 w-4" />
                      創作者收藏名單
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    登出
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                size="sm"
                className="gap-2 bg-gradient-to-r from-primary to-secondary"
                onClick={handleCreatorPortal}
              >
                <Palette className="h-4 w-4" />
                創作者入口
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
              >
                <User className="h-4 w-4" />
                會員登入
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
