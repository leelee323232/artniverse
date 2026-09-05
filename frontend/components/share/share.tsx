"use client";

import { useState, type ReactElement } from "react";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Link2, Copy, Check } from "lucide-react";

interface ShareProps {
  title?: string;
  subtitle?: string;
  shareUrl?: string;
  trigger?: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Share({
  title = "與好友分享",
  subtitle = "連結宇宙中的創作，與朋友分享精彩內容！",
  shareUrl,
  trigger,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: ShareProps) {
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();
  const resolvedUrl = shareUrl ?? (typeof window !== "undefined" ? `${window.location.origin}${pathname}` : "");

  const dialogProps =
    externalOpen !== undefined
      ? { open: externalOpen, onOpenChange: externalOnOpenChange }
      : {};

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resolvedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("複製失敗", err);
    }
  };

  const shareOptions = [
    {
      name: "Facebook",
      bgColor: "bg-[#1877F2]",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(resolvedUrl)}`,
      icon: <span className="text-white text-2xl font-bold leading-none">f</span>,
    },
    {
      name: "Instagram",
      bgColor: "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
      url: "https://www.instagram.com/artniverse_/",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      name: "X",
      bgColor: "bg-black border border-border/40",
      url: "", // TODO: 待補連結
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "LINE",
      bgColor: "bg-[#06C755]",
      url: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(resolvedUrl)}`,
      icon: <span className="text-white text-[11px] font-bold tracking-tight">LINE</span>,
    },
  ];

  return (
    <Dialog {...dialogProps}>
      {trigger && (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      )}

      <DialogContent className="max-w-sm border-border/50 bg-card/95 backdrop-blur-md rounded-2xl overflow-visible pt-14 pb-8 px-6">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{subtitle}</DialogDescription>

        {/* 頂部圓形圖示（半懸浮） */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 border border-border/50 backdrop-blur-sm shadow-lg shadow-primary/20">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
            <Link2 className="h-5 w-5 stroke-[2.5] text-white -rotate-45" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="mt-4 space-y-4">
          {/* 複製連結 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              分享連結
            </label>
            <div className="flex items-center gap-2 rounded-xl bg-background/60 border border-border/50 px-3 py-2.5">
              <span className="flex-1 truncate text-xs text-muted-foreground">
                {resolvedUrl}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-primary stroke-[2.5]" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* 社群分享 */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              分享至
            </label>
            <div className="flex items-center justify-around">
              {shareOptions.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${item.bgColor} shadow-sm transition-transform duration-200 group-hover:scale-110`}
                  >
                    {item.icon}
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    {item.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
