"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface ComingSoonProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 包住任何尚未串接的互動元素。
 * - hover 時顯示 tooltip
 * - click 時攔截事件並彈出 toast（手機也看得到）
 *
 * 用法：
 *   <ComingSoon>
 *     <button>按讚</button>
 *   </ComingSoon>
 */
export function ComingSoon({ children, className }: ComingSoonProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
    toast({ title: "功能即將推出", description: "敬請期待！" });
  };

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <span className={className} onClick={handleClick}>
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="flex items-center gap-1.5 px-3 py-2 text-xs">
        <Clock className="size-3 shrink-0" />
        <span>功能即將推出，敬請期待</span>
      </TooltipContent>
    </Tooltip>
  );
}

export default ComingSoon;
