"use client";

import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit: () => void;
  submitting?: boolean;
  submitLabel?: string;
  className?: string;
}

export function AdminModal({
  open,
  title,
  children,
  onClose,
  onSubmit,
  submitting = false,
  submitLabel = "儲存",
  className,
}: AdminModalProps) {
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className={cn("max-h-[90vh] overflow-y-auto", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
        >
          <div className="space-y-4">{children}</div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "處理中..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
