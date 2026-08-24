import { Badge } from "@/components/ui/badge";
import { useSubShiftTemplateComposition } from "../hooks/useSubShiftTemplateComposition";

type CompositionBadgeProps = {
  branchId: number;
  masterShiftTemplateId: number;
};

export default function SubShiftTemplateCompositionBadge({
  branchId,
  masterShiftTemplateId,
}: CompositionBadgeProps) {
  const { mainCount, supportCount, isLoading } = useSubShiftTemplateComposition(
    branchId,
    masterShiftTemplateId
  );

  if (isLoading) return null;

  if (mainCount === 0 && supportCount === 0) {
    return (
      <Badge variant="destructive" className="font-normal">
        No sub-shifts
      </Badge>
    );
  }

  return (
    <span className="text-sm text-muted-foreground">
      {mainCount} Main{supportCount ? ` Â· ${supportCount} Support` : ""}
    </span>
  );
}
