import { Separator } from "../ui/separator";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

type DrawerFormProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
  formId: string;
  isDirty: boolean;
  isLoading: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function DrawerForm({
  open,
  setOpen,
  onOpenChange,
  onDiscard,
  formId,
  isDirty,
  isLoading,
  title,
  description,
  children,
  footer,
}: DrawerFormProps) {
  const isMobile = useIsMobile();
  if (!open) return null;

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={onOpenChange}
    >
      <DrawerContent
        onInteractOutside={
          !isDirty && !isLoading
            ? () => setOpen(false)
            : () => onOpenChange(false)
        }
      >
        <DrawerHeader className="gap-1">
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <Separator className="mb-4" />
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {children}
        </div>
        <DrawerFooter>
          {footer}
          <Button
            type="submit"
            form={formId}
            className="bg-blue-600 text-white py-2 px-4 rounded"
            disabled={isLoading || !isDirty}
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="outline"
            className="py-2 px-4 rounded"
            onClick={() => onDiscard()}
            disabled={isLoading || !isDirty}
          >
            Discard
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
