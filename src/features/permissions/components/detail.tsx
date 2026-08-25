import { useGetPermission } from "../hooks/usePermissionQueries";
import { useCreatePermission, useUpdatePermission } from "../hooks/usePermissionMutations";
import PermissionForm from "./form";
import { PermissionFormValues } from "../types";
import { permissionFormSchema } from "../schemas/permission.schema";
import DrawerForm from "@/components/shared/drawer-form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type PermissionDetailProps = {
  id: number;
  open: boolean;
  // eslint-disable-next-line no-unused-vars
  setOpen: (open: boolean) => void;
};

export default function PermissionDetail({ id, open, setOpen }: PermissionDetailProps) {
  const formId = "permission-form";

  const { data: permission, isLoading } = useGetPermission(id);

  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: permission || {},
  });
  const {
    formState: { isDirty },
  } = form;

  useEffect(() => {
    if (permission) {
      form.reset({
        action: permission.action,
        subject: permission.subject,
        description: permission.description,
      });
    } else {
      form.reset({ action: "", subject: "", description: "" });
    }
  }, [permission, form]);

  const createMutation = useCreatePermission(form);
  const updateMutation = useUpdatePermission(form);

  const handleSubmit = (data: PermissionFormValues) => {
    const sanitizedData = {
      ...data,
      action: data.action.trim(),
      subject: data.subject.trim(),
      description: data.description?.trim(),
    };

    if (permission && permission.id) {
      updateMutation.mutate({ id: permission.id, ...sanitizedData });
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
      title={permission ? "Edit Permission" : "Create Permission"}
      description={permission ? "Edit permission details" : "Create a new permission"}
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
      <PermissionForm
        formId={formId}
        form={form}
        onSubmit={handleSubmit}
        error={form.formState.errors?.root?.message}
      />
    </DrawerForm>
  );
}
