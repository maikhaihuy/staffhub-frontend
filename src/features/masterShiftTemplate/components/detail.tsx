import { useGetMasterShiftTemplate } from "../hooks/useMasterShiftTemplateQueries";
import {
  useCreateMasterShiftTemplate,
  useUpdateMasterShiftTemplate,
} from "../hooks/useMasterShiftTemplateMutations";
import MasterShiftTemplateForm from "./form";
import { MasterShiftTemplateFormValues } from "../types";
import { masterShiftTemplateFormSchema } from "../schemas";
import DrawerForm from "@/components/shared/drawer-form";
import { Button } from "@/components/ui/button";
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
};

export default function MasterShiftTemplateDetail({
  branchId,
  id,
  open,
  setOpen,
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
    }
  }, [template, branchId, form]);

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
      createMutation.mutate(sanitizedData);
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
    </DrawerForm>
  );
}
