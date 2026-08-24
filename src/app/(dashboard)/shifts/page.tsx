"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MasterShiftTemplateEditDialog from "@/features/masterShiftTemplate/components/edit-dialog";
import MasterShiftTemplateList from "@/features/masterShiftTemplate/components/list";
import { MasterShiftTemplate } from "@/features/masterShiftTemplate/types";
import { useDeleteMasterShiftTemplate } from "@/features/masterShiftTemplate/hooks/useMasterShiftTemplateMutations";
import SubShiftTemplateCompositionBadge from "@/features/subShiftTemplate/components/composition-badge";
import { useGetBranches } from "@/features/branch/hooks/useBranchQueries";
import { ColumnConfig } from "@/components/shared/generic-table";
import { CalendarRange, Pen, PlusCircle, Trash2 } from "lucide-react";
import { getTime } from "@/lib/utils/dateTimeHelpers";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function ShiftTemplatesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: branches = [] } = useGetBranches();
  const [branchId, setBranchId] = useState<number>(0);

  useEffect(() => {
    const branchIdParam = Number(searchParams.get("branchId"));
    if (branchIdParam) setBranchId(branchIdParam);
  }, [searchParams]);

  useEffect(() => {
    if (!branchId && branches.length > 0) {
      setBranchId(branches[0].id);
    }
  }, [branches, branchId]);

  const deleteMutation = useDeleteMasterShiftTemplate(branchId);

  const [createOpen, setCreateOpen] = useState(false);

  const openCreate = () => setCreateOpen(true);

  const handleCreated = (newTemplateId: number) => {
    router.push(`/shifts/${newTemplateId}`);
  };

  const columns: ColumnConfig<MasterShiftTemplate>[] = useMemo(
    () => [
      {
        key: "name",
        label: "Name",
        className: "w-2/8 font-medium",
      },
      {
        key: "abbreviation",
        label: "Abbreviation",
        className: "w-1/8",
        render: (template) =>
          template.abbreviation ? (
            <Badge variant="outline" className="capitalize">
              {template.abbreviation}
            </Badge>
          ) : null,
      },
      {
        key: "startTime",
        label: "Time range",
        className: "w-2/8",
        render: (template) =>
          `${getTime(new Date(template.startTime))} - ${getTime(new Date(template.endTime))}`,
      },
      {
        key: "status",
        label: "Status",
        className: "w-1/8",
        render: (template) => (
          <Badge variant={template.status === "ACTIVE" ? "default" : "secondary"}>
            {template.status}
          </Badge>
        ),
      },
      {
        key: "composition",
        label: "Sub-shifts",
        className: "w-1/8",
        render: (template) => (
          <SubShiftTemplateCompositionBadge branchId={branchId} masterShiftTemplateId={template.id} />
        ),
      },
      {
        key: "actions",
        label: "",
        className: "w-1/8 text-right",
        render: (template) => (
          <>
            <Button variant="ghost" size="icon" asChild>
              <Link
                href={`/rosters?branchId=${branchId}`}
                title="View in Weekly Schedule"
              >
                <CalendarRange />
              </Link>
            </Button>
            <Button variant="secondary" size="icon" asChild>
              <Link href={`/shifts/${template.id}`} title="View details">
                <Pen />
              </Link>
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (window.confirm(`Delete shift template "${template.name}"?`)) {
                  deleteMutation.mutate(template.id);
                }
              }}
            >
              <Trash2 />
            </Button>
          </>
        ),
      },
    ],
    [deleteMutation, branchId]
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-row justify-between items-center">
        <div className="px-2 flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Loại ca làm việc</h1>
          <div className="text-sm font-medium text-muted-foreground">
            Định nghĩa các loại ca làm việc lặp lại theo chi nhánh.
          </div>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <Select
            value={branchId ? String(branchId) : undefined}
            onValueChange={(value) => setBranchId(Number(value))}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={String(branch.id)}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="gap-1"
            disabled={!branchId}
            onClick={openCreate}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Thêm mới
            </span>
          </Button>
        </div>
      </div>
      {branchId ? (
        <>
          <MasterShiftTemplateList
            branchId={branchId}
            columns={columns}
            emptyMessage={
              <div className="flex flex-col items-center gap-2 py-2">
                <p className="text-muted-foreground">
                  This branch has no shift templates yet.
                </p>
                <Button variant="outline" size="sm" className="gap-1" onClick={openCreate}>
                  <PlusCircle className="h-3.5 w-3.5" />
                  Create your first shift template
                </Button>
              </div>
            }
          />
          <MasterShiftTemplateEditDialog
            branchId={branchId}
            id={0}
            open={createOpen}
            setOpen={setCreateOpen}
            onCreated={handleCreated}
          />
        </>
      ) : (
        <p className="text-muted-foreground">No branches available.</p>
      )}
    </div>
  );
}
