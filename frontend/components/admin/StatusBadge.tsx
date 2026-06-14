import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  active: boolean;
}

export function StatusBadge({ active }: StatusBadgeProps) {
  return (
    <Badge
      variant={active ? "default" : "secondary"}
      className={cn(
        active
          ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15"
          : "bg-muted text-muted-foreground hover:bg-muted",
      )}
    >
      {active ? "啟用中" : "已停用"}
    </Badge>
  );
}
