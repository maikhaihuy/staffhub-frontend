import { useGetRole } from "../hooks/useRoleQueries";
import { useCreateRole, useUpdateRole } from "../hooks/useRoleMutations";
import RoleForm from "./form";
import { RoleFormValues } from "../types";
import { roleFormSchema } from "../schemas/role.schema";
import DrawerForm from "@/components/shared/drawer-form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type RoleDetailProps = {
  id: number;
  open: boolean;
  // eslint-disable-next-line no-unused-vars
  setOpen: (open: boolean) => void;
};

export default function RoleDetail({ id, open, setOpen }: RoleDetailProps) {
  const formId = "role-form";

  const { data: role, isLoading } = useGetRole(id);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: role || {},
  });
  const {
    formState: { isDirty },
  } = form;

  useEffect(() => {
    if (role) {
      form.reset({ name: role.name, description: role.description });
    } else {
      form.reset({ name: "", description: "" });
    }
  }, [role, form]);

  const createMutation = useCreateRole(form);
  const updateMutation = useUpdateRole(form);

  const handleSubmit = (data: RoleFormValues) => {
    const sanitizedData = {
      ...data,
      name: data.name.trim(),
      description: data.description?.trim(),
    };

    if (role && role.id) {
      updateMutation.mutate({ id: role.id, ...sanitizedData });
    } else {
      // New roles start with no permissions - granted afterward via the
      // Permission Matrix screen.
      createMutation.mutate({ ...sanitizedData, permissionIds: [] });
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
      title={role ? "Edit Role" : "Create Role"}
      description={role ? "Edit role details" : "Create a new role"}
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
      <RoleForm
        formId={formId}
        form={form}
        onSubmit={handleSubmit}
        error={form.formState.errors?.root?.message}
      />
    </DrawerForm>
  );
}
