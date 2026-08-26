"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Archive, ArrowLeft, Copy, MoreHorizontal, Pen } from "lucide-react";

import { RequireAbility } from "@/components/require-ability";
import MasterShiftTemplateEditDialog from "@/features/masterShiftTemplate/components/edit-dialog";
import { useGetMasterShiftTemplate } from "@/features/masterShiftTemplate/hooks/useMasterShiftTemplateQueries";
import { useUpdateMasterShiftTemplate } from "@/features/masterShiftTemplate/hooks/useMasterShiftTemplateMutations";
import { MasterShiftTemplateFormValues } from "@/features/masterShiftTemplate/types";
import SubShiftTemplateSection from "@/features/subShiftTemplate/components/sub-shift-template-section";
import { subShiftTemplateService } from "@/features/subShiftTemplate/services/subShiftTemplate.service";
import { SubShiftTemplate } from "@/features/subShiftTemplate/types";
import { queryKeys } from "@/lib/queryKeys";
import { getTime } from "@/lib/utils/dateTimeHelpers";

export default function ShiftTemplateDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: template, isLoading } = useGetMasterShiftTemplate(id);
  const branchId = template?.branchId ?? 0;

  const updateMutation = useUpdateMasterShiftTemplate(branchId);

  const [editOpen, setEditOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [duplicateInitialValues, setDuplicateInitialValues] =
    useState<Partial<MasterShiftTemplateFormValues>>();
  const [duplicateSubShiftTemplates, setDuplicateSubShiftTemplates] =
    useState<SubShiftTemplate[]>();

  const handleDuplicate = useCallback(async () => {
    if (!template) return;
    const subShiftTemplates = await subShiftTemplateService.listByMasterShiftTemplate(
      branchId,
      template.id
    );
    setDuplicateInitialValues({
      name: `${template.name} (Copy)`,
      abbreviation: template.abbreviation,
      startTime: getTime(new Date(template.startTime)),
      endTime: getTime(new Date(template.endTime)),
      status: "DRAFT",
      note: template.note,
    });
    setDuplicateSubShiftTemplates(subShiftTemplates);
    setDuplicateOpen(true);
  }, [template, branchId]);

  const handleDuplicateCreated = async (newTemplateId: number) => {
    const sourceSubShiftTemplates = duplicateSubShiftTemplates ?? [];
    setDuplicateSubShiftTemplates(undefined);
    setDuplicateInitialValues(undefined);

    for (const source of sourceSubShiftTemplates) {
      try {
        await subShiftTemplateService.create({
          branchId,
          masterShiftTemplateId: newTemplateId,
          name: source.name,
          type: source.type,
          startTime: source.startTime,
          endTime: source.endTime,
          maxAssignments: source.maxAssignments,
          sortOrder: source.sortOrder,
          status: source.status,
          note: source.note,
        });
      } catch {
        toast.error(`Couldn't copy sub-shift "${source.name}" - add it manually`);
      }
    }
    await queryClient.invalidateQueries({
      queryKey: queryKeys.subShiftTemplates.byMasterShiftTemplate(branchId, newTemplateId),
    });
    router.push(`/shifts/${newTemplateId}`);
  };

  const handleArchive = () => {
    if (!template) return;
    if (!window.confirm(`Archive shift template "${template.name}"?`)) return;
    updateMutation.mutate({ id: template.id, status: "ARCHIVED" });
  };

  if (isLoading) {
    return (
      <RequireAbility action="read" subject="Shift">
        <p className="text-muted-foreground">Loading...</p>
      </RequireAbility>
    );
  }

  if (!template) {
    return (
      <RequireAbility action="read" subject="Shift">
        <div className="flex flex-col gap-4">
          <Button variant="ghost" className="w-fit gap-1 px-2" asChild>
            <Link href="/shifts">
              <ArrowLeft className="h-4 w-4" />
              Back to Shift Templates
            </Link>
          </Button>
          <p className="text-muted-foreground">This shift template couldn&apos;t be found.</p>
        </div>
      </RequireAbility>
    );
  }

  return (
    <RequireAbility action="read" subject="Shift">
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" className="w-fit gap-1 px-2" asChild>
          <Link href="/shifts">
            <ArrowLeft className="h-4 w-4" />
            Back to Shift Templates
          </Link>
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">{template.name}</h1>
            <p className="text-sm text-muted-foreground">
              {getTime(new Date(template.startTime))} - {getTime(new Date(template.endTime))}
            </p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Button variant="outline" className="gap-1" onClick={() => setEditOpen(true)}>
              <Pen className="h-3.5 w-3.5" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="h-3.5 w-3.5" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleArchive}
                  disabled={template.status === "ARCHIVED"}
                >
                  <Archive className="h-3.5 w-3.5" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Name</span>
            <span className="text-sm font-medium">{template.name}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Start time</span>
            <span className="text-sm font-medium">{getTime(new Date(template.startTime))}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">End time</span>
            <span className="text-sm font-medium">{getTime(new Date(template.endTime))}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Status</span>
            <Badge
              variant={template.status === "ACTIVE" ? "default" : "secondary"}
              className="w-fit"
            >
              {template.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Sub Shifts</h2>
        <SubShiftTemplateSection
          branchId={branchId}
          masterShiftTemplateId={template.id}
          masterLabel={template.name}
          masterRange={{ startTime: template.startTime, endTime: template.endTime }}
        />
      </div>

      <MasterShiftTemplateEditDialog
        branchId={branchId}
        id={template.id}
        open={editOpen}
        setOpen={setEditOpen}
      />
      <MasterShiftTemplateEditDialog
        branchId={branchId}
        id={0}
        open={duplicateOpen}
        setOpen={setDuplicateOpen}
        onCreated={handleDuplicateCreated}
        initialValues={duplicateInitialValues}
      />
    </div>
    </RequireAbility>
  );
}
