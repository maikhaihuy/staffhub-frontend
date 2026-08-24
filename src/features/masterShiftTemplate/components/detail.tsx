import { useGetMasterShiftTemplate } from "../hooks/useMasterShiftTemplateQueries";
import {
  useCreateMasterShiftTemplate,
  useUpdateMasterShiftTemplate,
} from "../hooks/useMasterShiftTemplateMutations";
import MasterShiftTemplateForm from "./form";
import { MasterShiftTemplateFormValues } from "../types";
import { masterShiftTemplateFormSchema } from "../schemas";
import DrawerForm from "@/components/shared/drawer-form";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import SubShiftTemplateSection from "@/features/subShiftTemplate/components/sub-shift-template-section";
import TaskTemplateSection from "@/features/taskTemplate/components/task-template-section";
import { zodResolver } from "@hookform/resolvers/zod";
import { getTime, getTimeFromString } from "@/lib/utils/dateTimeHelpers";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type MasterShiftTemplateDetailProps = {
  branchId: number;
  id: number;
  open: boolean;
  // eslint-disable-next-line no-unused-vars
  setOpen: (open: boolean) => void;
  // Called with the new template's id right after a successful create, so
  // the parent can switch this drawer into edit mode in place - otherwise
  // there's no way to add sub-shift templates/tasks without closing and
  // reopening the drawer.
  // eslint-disable-next-line no-unused-vars
  onCreated?: (id: number) => void;
  // Pre-fills a fresh create form (e.g. from "Duplicate") - only applied
  // while there's no existing template (id === 0).
  initialValues?: Partial<MasterShiftTemplateFormValues>;
};

export default function MasterShiftTemplateDetail({
  branchId,
  id,
  open,
  setOpen,
  onCreated,
  initialValues,
}: MasterShiftTemplateDetailProps) {
  const formId = "master-shift-template-form";

  const { data: template, isLoading } = useGetMasterShiftTemplate(id);

  const form = useForm<MasterShiftTemplateFormValues>({
    resolver: zodResolver(masterShiftTemplateFormSchema),
    defaultValues: { branchId, status: "ACTIVE" },
  });
  const {
    formState: { isDirty },
  } = form;

  // Reset form when templateData changes (for edit) - backend stores
  // startTime/endTime as full ISO strings, form uses plain "HH:mm".
  useEffect(() => {
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
  }, [template, branchId, form, initialValues]);

  const createMutation = useCreateMasterShiftTemplate(branchId);
  const updateMutation = useUpdateMasterShiftTemplate(branchId);

  const handleSubmit = (data: MasterShiftTemplateFormValues) => {
    const sanitizedData = {
      ...data,
      branchId,
      name: data.name.trim(),
      startTime: getTimeFromString(data.startTime).toISOString(),
      endTime: getTimeFromString(data.endTime).toISOString(),
    };

    if (template && template.id) {
      updateMutation.mutate({ id: template.id, ...sanitizedData });
    } else {
      createMutation.mutate(sanitizedData, {
        onSuccess: (created) => onCreated?.(created.id),
      });
    }
  };

  const handleDiscard = () => {
    form.reset();
    setOpen(false);
  };

  return (
    <DrawerForm
      open={open}
      setOpen={setOpen}
      title={template ? "Edit Shift Template" : "Create Shift Template"}
      description={template ? "Edit shift template details" : "Create a new shift template"}
      isPreventInteractOutside={isLoading || isDirty}
      contentClassName="sm:max-w-xl"
      footer={
        <>
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
            onClick={() => handleDiscard()}
            disabled={isLoading || !isDirty}
          >
            Discard
          </Button>
        </>
      }
    >
      <MasterShiftTemplateForm
        formId={formId}
        form={form}
        onSubmit={handleSubmit}
        error={form.formState.errors?.root?.message}
      />

      {template?.id ? (
        <>
          <Separator />
          <SubShiftTemplateSection
            branchId={branchId}
            masterShiftTemplateId={template.id}
            masterLabel={template.name}
            masterRange={{ startTime: template.startTime, endTime: template.endTime }}
          />
          <Separator />
          <TaskTemplateSection branchId={branchId} masterShiftTemplateId={template.id} />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Save the template first to add sub-shift templates - you&apos;ll see them here as a timeline.
        </p>
      )}
    </DrawerForm>
  );
}
