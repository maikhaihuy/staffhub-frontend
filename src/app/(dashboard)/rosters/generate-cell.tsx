import { Button } from "@/components/ui/button";
import { useSubShiftTemplateComposition } from "@/features/subShiftTemplate/hooks/useSubShiftTemplateComposition";
import { useGenerateMasterShift } from "@/features/masterShift/hooks/useMasterShiftMutations";
import { Plus } from "lucide-react";

interface GenerateCellProps {
  branchId: number;
  masterShiftTemplateId: number;
  templateName: string;
  workDate: string;
}

export function GenerateCell({
  branchId,
  masterShiftTemplateId,
  templateName,
  workDate,
}: GenerateCellProps) {
  const { isEligibleForGeneration, isLoading } = useSubShiftTemplateComposition(
    branchId,
    masterShiftTemplateId
  );
  const generateMutation = useGenerateMasterShift();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="justify-start gap-2 w-full sm:w-auto"
      disabled={isLoading || !isEligibleForGeneration || generateMutation.isPending}
      title={
        isEligibleForGeneration
          ? "Generate this shift"
          : "Add at least one sub-shift template first"
      }
      onClick={() => generateMutation.mutate({ masterShiftTemplateId, workDate })}
    >
      <Plus className="h-4 w-4" />
      Generate &quot;{templateName}&quot;
    </Button>
  );
}
