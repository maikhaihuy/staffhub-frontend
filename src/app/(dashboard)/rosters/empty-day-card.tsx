import { Card } from "@/components/ui/card";
import { GenerateCell } from "./generate-cell";
import { useGetMasterShiftTemplatesByBranch } from "@/features/masterShiftTemplate/hooks/useMasterShiftTemplateQueries";

interface EmptyDayCardProps {
  branchId: number;
  workDate: string;
}

export function EmptyDayCard({ branchId, workDate }: EmptyDayCardProps) {
  const { data: templates = [] } = useGetMasterShiftTemplatesByBranch(branchId);

  return (
    <Card className="p-4 gap-3">
      <p className="text-sm text-muted-foreground">No shifts generated for this day.</p>
      {templates.length > 0 && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          {templates.map((template) => (
            <GenerateCell
              key={template.id}
              branchId={branchId}
              masterShiftTemplateId={template.id}
              templateName={template.name}
              workDate={workDate}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
