"use client";

import { ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SortableConfig {
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

interface AdminRowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  sortable?: SortableConfig;
}

export function AdminRowActions({
  onEdit,
  onDelete,
  sortable,
}: AdminRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      {sortable && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={sortable.isFirst}
            onClick={sortable.onMoveUp}
            aria-label="上移"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={sortable.isLast}
            onClick={sortable.onMoveDown}
            aria-label="下移"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onEdit}
        aria-label="編輯"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={onDelete}
        aria-label="刪除"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
