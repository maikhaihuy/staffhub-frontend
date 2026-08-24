import { useGetMasterShiftTemplate } from "../hooks/useMasterShiftTemplateQueries";
import {
  useCreateMasterShiftTemplate,
  useUpdateMasterShiftTemplate,
} from "../hooks/useMasterShiftTemplateMutations";
import MasterShiftTemplateForm from "./form";
import { MasterShiftTemplateFormValues } from "../types";
import { masterShiftTemplateFormSchema } from "../schemas";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { getTime, getTimeFromString } from "@/lib/utils/dateTimeHelpers";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type MasterShiftTemplateEditDialogProps = {
  branchId: number;
  id: number;
  open: boolean;
  // eslint-disable-next-line no-unused-vars
  setOpen: (open: boolean) => void;
  // Called with the new template's id right after a successful create, so
  // the caller can navigate to its detail page.
  // eslint-disable-next-line no-unused-vars
  onCreated?: (id: number) => void;
  // Pre-fills a fresh create form (e.g. from "Duplicate") - only applied
  // while there's no existing template (id === 0).
  initialValues?: Partial<MasterShiftTemplateFormValues>;
};

export default function MasterShiftTemplateEditDialog({
  branchId,
  id,
  open,
  setOpen,
  onCreated,
  initialValues,
}: MasterShiftTemplateEditDialogProps) {
  const formId = "master-shift-template-edit-form";

  const { data: template, isLoading } = useGetMasterShiftTemplate(id);

  const form = useForm<MasterShiftTemplateFormValues>({
    resolver: zodResolver(masterShiftTemplateFormSchema),
    defaultValues: { branchId, status: "ACTIVE" },
  });

  // Reset form whenever the dialog opens - backend stores startTime/endTime
  // as full ISO strings, form uses plain "HH:mm".
  useEffect(() => {
    if (!open) return;
    if (template) {
      form.reset({
        ...template,
        startTime: getTime(new Date(template.startTime)),
        endTime: getTime(new Date(template.endTime)),
      });
    } else {
      form.reset({
        branchId,
        name: "",
        abbreviation: "",
        startTime: "",
        endTime: "",
        status: "ACTIVE",
        note: "",
      });
      // Applied via setValue(shouldDirty: true) rather than folded into the
      // reset() baseline above, so the prefilled fields count as a real
      // change - otherwise Save stays disabled since nothing would be dirty.
      if (initialValues) {
        Object.entries(initialValues).forEach(([key, value]) => {
          form.setValue(key as keyof MasterShiftTemplateFormValues, value as never, {
            shouldDirty: true,
          });
        });
      }
    }
  }, [open, template, branchId, form, initialValues]);

  const createMutation = useCreateMasterShiftTemplate(branchId, form);
  const updateMutation = useUpdateMasterShiftTemplate(branchId, form);

  const handleSubmit = (data: MasterShiftTemplateFormValues) => {
    const sanitizedData = {
      ...data,
      branchId,
      name: data.name.trim(),
      startTime: getTimeFromString(data.startTime).toISOString(),
      endTime: getTimeFromString(data.endTime).toISOString(),
    };

    if (template && template.id) {
      updateMutation.mutate(
        { id: template.id, ...sanitizedData },
        { onSuccess: () => setOpen(false) }
      );
    } else {
      createMutation.mutate(sanitizedData, {
        onSuccess: (created) => {
          setOpen(false);
          onCreated?.(created.id);
        },
      });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{template ? "Edit Shift Template" : "Create Shift Template"}</DialogTitle>
        </DialogHeader>
        <MasterShiftTemplateForm
          formId={formId}
          form={form}
          onSubmit={handleSubmit}
          error={form.formState.errors?.root?.message}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={isLoading || isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
