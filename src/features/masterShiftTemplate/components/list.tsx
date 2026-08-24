import { useGetMasterShiftTemplatesByBranch } from "../hooks/useMasterShiftTemplateQueries";
import { MasterShiftTemplate } from "../types";
import { GenericTable, ColumnConfig } from "@/components/shared/generic-table";
import type { ReactNode } from "react";

type MasterShiftTemplateListProps = {
  branchId: number;
  columns: ColumnConfig<MasterShiftTemplate>[];
  emptyMessage?: ReactNode;
};

export default function MasterShiftTemplateList({
  branchId,
  columns,
  emptyMessage,
}: MasterShiftTemplateListProps) {
  const { data: templates, isLoading } = useGetMasterShiftTemplatesByBranch(branchId);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="overflow-hidden rounded-lg border">
      <GenericTable
        columns={columns}
        data={templates ?? []}
        rowKey={(template) => template.id!}
        emptyMessage={emptyMessage}
      />
    </div>
  );
}
