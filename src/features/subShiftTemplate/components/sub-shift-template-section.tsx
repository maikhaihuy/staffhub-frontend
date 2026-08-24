import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pen, PlusCircle, Trash2 } from "lucide-react";
import { getTime, getTimeFromString } from "@/lib/utils/dateTimeHelpers";
import {
  useGetSubShiftTemplatesByMasterShiftTemplate,
} from "../hooks/useSubShiftTemplateQueries";
import {
  useCreateSubShiftTemplate,
  useDeleteSubShiftTemplate,
  useUpdateSubShiftTemplate,
} from "../hooks/useSubShiftTemplateMutations";
import { subShiftTemplateFormSchema } from "../schemas";
import { SubShiftTemplate, SubShiftTemplateFormValues } from "../types";
import { findMainOverlapConflict } from "../utils/checkMainOverlap";
import { findOutOfBoundsConflict } from "../utils/checkBounds";
import { TimeRange } from "../utils/timeRange";
import SubShiftTemplateForm from "./sub-shift-template-form";
import SubShiftTemplateTimeline from "./timeline";

type SubShiftTemplateSectionProps = {
  branchId: number;
  masterShiftTemplateId: number;
  masterLabel: string;
  masterRange: TimeRange;
};

const TYPE_LABEL: Record<SubShiftTemplate["type"], string> = {
  MAIN: "Main",
  SUPPORT: "Support",
};

const emptyFormValues = (
  branchId: number,
  masterShiftTemplateId: number
): SubShiftTemplateFormValues => ({
  branchId,
  masterShiftTemplateId,
  name: "",
  type: "MAIN",
  startTime: "",
  endTime: "",
  maxAssignments: undefined,
  note: "",
});

export default function SubShiftTemplateSection({
  branchId,
  masterShiftTemplateId,
  masterLabel,
  masterRange,
}: SubShiftTemplateSectionProps) {
  const formId = "sub-shift-template-form";
  const { data: subShiftTemplates = [], isLoading } =
    useGetSubShiftTemplatesByMasterShiftTemplate(branchId, masterShiftTemplateId);

  const createMutation = useCreateSubShiftTemplate(branchId, masterShiftTemplateId);
  const updateMutation = useUpdateSubShiftTemplate(branchId, masterShiftTemplateId);
  const deleteMutation = useDeleteSubShiftTemplate(branchId, masterShiftTemplateId);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SubShiftTemplate | null>(null);

  const form = useForm<SubShiftTemplateFormValues>({
    resolver: zodResolver(subShiftTemplateFormSchema),
    defaultValues: emptyFormValues(branchId, masterShiftTemplateId),
  });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.reset({
        ...editing,
        startTime: getTime(new Date(editing.startTime)),
        endTime: getTime(new Date(editing.endTime)),
      });
    } else {
      form.reset(emptyFormValues(branchId, masterShiftTemplateId));
    }
  }, [open, editing, branchId, masterShiftTemplateId, form]);

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (subShiftTemplate: SubShiftTemplate) => {
    setEditing(subShiftTemplate);
    setOpen(true);
  };

  const handleSubmit = (data: SubShiftTemplateFormValues) => {
    if (findOutOfBoundsConflict(data, masterRange)) {
      const message = `Must be within the shift template's hours (${getTime(
        new Date(masterRange.startTime)
      )} - ${getTime(new Date(masterRange.endTime))})`;
      form.setError("startTime", { message });
      form.setError("endTime", { message });
      return;
    }

    const conflict = findMainOverlapConflict(data, subShiftTemplates, editing?.id);
    if (conflict) {
      const message = `Overlaps with MAIN sub-shift "${conflict.name}" (${getTime(
        new Date(conflict.startTime)
      )} - ${getTime(new Date(conflict.endTime))})`;
      form.setError("startTime", { message });
      form.setError("endTime", { message });
      return;
    }

    const sanitized = {
      ...data,
      branchId,
      masterShiftTemplateId,
      name: data.name.trim(),
      startTime: getTimeFromString(data.startTime).toISOString(),
      endTime: getTimeFromString(data.endTime).toISOString(),
    };

    if (editing) {
      updateMutation.mutate(
        { id: editing.id, ...sanitized },
        { onSuccess: () => setOpen(false) }
      );
    } else {
      createMutation.mutate(sanitized, { onSuccess: () => setOpen(false) });
    }
  };

  const handleDelete = (subShiftTemplate: SubShiftTemplate) => {
    if (window.confirm(`Remove sub-shift "${subShiftTemplate.name}"?`)) {
      deleteMutation.mutate(subShiftTemplate.id);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center justify-between">
        <h3 className="text-sm font-semibold">Sub-shift templates</h3>
        <Button type="button" variant="outline" size="sm" className="gap-1" onClick={openCreate}>
          <PlusCircle className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      {!isLoading && (
        <SubShiftTemplateTimeline
          masterLabel={masterLabel}
          masterRange={masterRange}
          subShiftTemplates={subShiftTemplates}
        />
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : subShiftTemplates.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No sub-shift templates yet. Add at least one before this template can be generated.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {subShiftTemplates.map((subShiftTemplate) => (
            <div
              key={subShiftTemplate.id}
              className="flex flex-row items-center justify-between rounded-md border p-2 text-sm"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{subShiftTemplate.name}</span>
                  <Badge variant={subShiftTemplate.type === "MAIN" ? "default" : "secondary"}>
                    {TYPE_LABEL[subShiftTemplate.type]}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {getTime(new Date(subShiftTemplate.startTime))} -{" "}
                  {getTime(new Date(subShiftTemplate.endTime))}
                  {subShiftTemplate.maxAssignments
                    ? ` Â· max ${subShiftTemplate.maxAssignments}`
                    : ""}
                </span>
              </div>
              <div className="flex flex-row gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(subShiftTemplate)}
                >
                  <Pen className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(subShiftTemplate)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit sub-shift" : "Add sub-shift"}</DialogTitle>
          </DialogHeader>
          <SubShiftTemplateForm
            formId={formId}
            form={form}
            masterRange={masterRange}
            onSubmit={handleSubmit}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={formId} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
