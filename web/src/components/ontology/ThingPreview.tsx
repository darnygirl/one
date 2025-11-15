/**
 * ThingPreview Component
 * Quick preview modal/drawer for things
 */

import { type Thing } from "@/lib/ontology/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Card } from "./Card";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

interface ThingPreviewProps {
  thing: Thing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "dialog" | "drawer" | "auto";
}

export function ThingPreview({
  thing,
  open,
  onOpenChange,
  mode = "auto",
}: ThingPreviewProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!thing) return null;

  const useDialog = mode === "dialog" || (mode === "auto" && isDesktop);

  if (useDialog) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{thing.name}</DialogTitle>
            <DialogDescription>
              Quick preview of this {thing.type}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Card thing={thing} view="detail" showActions={true} />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>{thing.name}</DrawerTitle>
          <DrawerDescription>
            Quick preview of this {thing.type}
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 overflow-y-auto">
          <Card thing={thing} view="detail" showActions={true} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
