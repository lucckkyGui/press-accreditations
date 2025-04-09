
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

type BulkAction = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
  onClick: (selectedIds: string[]) => void;
};

type BulkActionsProps = {
  selectedIds: string[];
  actions: BulkAction[];
  onSelectionClear: () => void;
};

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedIds,
  actions,
  onSelectionClear,
}) => {
  const [isActioning, setIsActioning] = useState(false);

  if (selectedIds.length === 0) {
    return null;
  }

  const handleAction = async (action: BulkAction) => {
    try {
      setIsActioning(true);
      await action.onClick(selectedIds);
    } catch (error) {
      console.error("Error performing bulk action:", error);
      toast.error("Wystąpił błąd podczas wykonywania operacji");
    } finally {
      setIsActioning(false);
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-2">
      <span className="text-sm">
        Wybrano <strong>{selectedIds.length}</strong> element(ów)
      </span>

      <Button size="sm" variant="ghost" onClick={onSelectionClear}>
        Wyczyść wybór
      </Button>

      <div className="flex-1" />

      {actions.map(
        (action) =>
          action.variant === "destructive" && (
            <Button
              key={action.id}
              size="sm"
              variant="destructive"
              onClick={() => handleAction(action)}
              disabled={isActioning}
              className="gap-1"
            >
              {action.icon}
              {action.label}
            </Button>
          )
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="gap-1" disabled={isActioning}>
            Akcje <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions
            .filter((action) => action.variant !== "destructive")
            .map((action) => (
              <DropdownMenuItem
                key={action.id}
                onClick={() => handleAction(action)}
                className="gap-2"
              >
                {action.icon}
                {action.label}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
