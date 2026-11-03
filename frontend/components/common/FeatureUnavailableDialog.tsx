"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FeatureUnavailableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Controlled notice for features that are not available yet. */
export function FeatureUnavailableDialog({
  open,
  onOpenChange,
}: FeatureUnavailableDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden rounded-2xl border-primary/20 p-0 sm:max-w-md"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="relative px-6 pt-9 pb-6 sm:px-8 sm:pb-8">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <Sparkles className="size-7" aria-hidden="true" />
          </div>
          <DialogHeader className="items-center gap-3 text-center sm:text-center">
            <DialogTitle className="text-xl leading-relaxed font-semibold">
              功能即將推出，敬請期待
            </DialogTitle>
            <DialogDescription className="text-center leading-7">
              我們正在準備這項功能，完成後將正式開放。
              <br />
              感謝你的耐心等候。
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <Button type="button" className="mt-7 w-full">
              我知道了
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
