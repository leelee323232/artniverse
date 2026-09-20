"use client";

import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "./StatusBadge";

interface StatusToggleProps {
  active: boolean;
  onToggle: () => void;
}

export function StatusToggle({ active, onToggle }: StatusToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <Switch checked={active} onCheckedChange={onToggle} aria-label="切換啟用狀態" />
      <StatusBadge active={active} />
    </div>
  );
}
