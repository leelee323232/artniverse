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
import { Link2, Copy, Check, Mail } from "lucide-react";

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
      name: "LINE",
      bgColor: "bg-[#06C755]",
      url: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(resolvedUrl)}`,
      icon: <span className="text-white text-[11px] font-bold tracking-tight">LINE</span>,
    },
    {
      name: "Gmail",
      bgColor: "bg-card border border-border/60",
      url: `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(title)}&body=${encodeURIComponent(`${subtitle}\n\n${resolvedUrl}`)}`,
      icon: <Mail className="h-6 w-6 text-[#EA4335] stroke-[2.5]" />,
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
