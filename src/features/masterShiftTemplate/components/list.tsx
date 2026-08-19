import { useGetMasterShiftTemplatesByBranch } from "../hooks/useMasterShiftTemplateQueries";
import { MasterShiftTemplate } from "../types";
import { GenericTable, ColumnConfig } from "@/components/shared/generic-table";

type MasterShiftTemplateListProps = {
  branchId: number;
  columns: ColumnConfig<MasterShiftTemplate>[];
};

export default function MasterShiftTemplateList({
  branchId,
  columns,
}: MasterShiftTemplateListProps) {
  const { data: templates, isLoading } = useGetMasterShiftTemplatesByBranch(branchId);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="overflow-hidden rounded-lg border">
      <GenericTable
        columns={columns}
        data={templates ?? []}
        rowKey={(template) => template.id!}
      />
    </div>
  );
}
