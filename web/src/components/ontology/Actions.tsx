/**
 * Actions Component
 * Renders action buttons with primary/secondary/context menu options
 */

import { type Thing, type ActionConfig } from "@/lib/ontology/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical } from "lucide-react";
import { useState } from "react";

interface ActionsProps {
  thing: Thing;
  primary?: ActionConfig;
  secondary?: ActionConfig[];
  context?: ActionConfig[];
}

export function Actions({ thing, primary, secondary, context }: ActionsProps) {
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ActionConfig | null>(null);

  const handleAction = async (action: ActionConfig) => {
    // Show confirmation dialog if required
    if (action.confirm) {
      setConfirmAction(action);
      return;
    }

    await executeAction(action);
  };

  const executeAction = async (action: ActionConfig) => {
    setLoading(true);

    try {
      // TODO: Implement actual action execution via hooks
      console.log("Executing action:", action.action, "on thing:", thing);

      // Example action handlers
      switch (action.action) {
        case "enroll":
        case "purchase":
        case "addToCart":
          // Navigate or trigger purchase flow
          window.location.href = `/checkout?thing=${thing._id}`;
          break;

        case "preview":
        case "read":
        case "quickView":
          // Navigate to detail page
          window.location.href = `/${thing.type}/${thing._id}`;
          break;

        case "edit":
          // Navigate to edit page
          window.location.href = `/edit/${thing.type}/${thing._id}`;
          break;

        case "delete":
          // Call delete mutation
          console.log("Delete:", thing._id);
          break;

        case "share":
          // Use Web Share API
          if (navigator.share) {
            await navigator.share({
              title: thing.name,
              url: window.location.href,
            });
          }
          break;

        case "bookmark":
        case "wishlist":
        case "like":
          // Toggle bookmark/wishlist/like
          console.log("Toggle:", action.action, thing._id);
          break;

        default:
          console.warn(`Unknown action: ${action.action}`);
      }
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 w-full">
        {/* Primary action */}
        {primary && (
          <Button
            variant={primary.variant === "danger" ? "destructive" : "default"}
            className="flex-1"
            disabled={loading}
            onClick={() => handleAction(primary)}
          >
            {loading ? "Loading..." : primary.label}
          </Button>
        )}

        {/* Secondary actions */}
        {secondary && secondary.length > 0 && (
          <div className="flex gap-2">
            {secondary.map((action) => (
              <Button
                key={action.action}
                variant={action.variant === "ghost" ? "ghost" : "outline"}
                size="icon"
                disabled={loading}
                onClick={() => handleAction(action)}
              >
                {/* Icon placeholder - use lucide-react in production */}
                <span className="h-4 w-4" />
              </Button>
            ))}
          </div>
        )}

        {/* Context menu (more actions) */}
        {context && context.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {context.map((action, index) => (
                <div key={action.action}>
                  {index > 0 && action.variant === "danger" && (
                    <DropdownMenuSeparator />
                  )}
                  <DropdownMenuItem
                    onClick={() => handleAction(action)}
                    className={
                      action.variant === "danger" ? "text-destructive" : ""
                    }
                  >
                    {action.label}
                  </DropdownMenuItem>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Confirmation dialog */}
      {confirmAction && (
        <AlertDialog
          open={!!confirmAction}
          onOpenChange={() => setConfirmAction(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                {confirmAction.confirm}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  await executeAction(confirmAction);
                  setConfirmAction(null);
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
