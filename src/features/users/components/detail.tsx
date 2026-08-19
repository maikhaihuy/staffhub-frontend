import { useGetUser } from "../hooks/useUserQueries";
import { useCreateUser, useUpdateUser } from "../hooks/useUserMutations";
import { useGetRoles } from "@/features/roles/hooks/useRoleQueries";
import UserForm from "./form";
import { UserFormValues } from "../types";
import { userFormSchema } from "../schemas/user.schema";
import DrawerForm from "@/components/shared/drawer-form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type UserDetailProps = {
  id: number;
  open: boolean;
  // eslint-disable-next-line no-unused-vars
  setOpen: (open: boolean) => void;
};

export default function UserDetail({ id, open, setOpen }: UserDetailProps) {
  const formId = "user-form";

  const { data: user, isLoading } = useGetUser(id);
  const { data: roles = [], isLoading: isRolesLoading } = useGetRoles();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: user || { status: "ACTIVE" },
  });
  const {
    formState: { isDirty },
  } = form;

  // Reset form when userData changes (for edit)
  useEffect(() => {
    if (user) {
      form.reset(user);
    } else {
      form.reset({
        fullName: "",
        phoneNumber: "",
        avatarUrl: "",
        status: "ACTIVE",
      });
    }
  }, [user, form]);

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const handleSubmit = (data: UserFormValues) => {
    const sanitizedData = {
      ...data,
      fullName: data.fullName.trim(),
      phoneNumber: data.phoneNumber.trim(),
      avatarUrl: data.avatarUrl?.trim() || undefined,
    };

    if (user && user.id) {
      updateMutation.mutate({ id: user.id, ...sanitizedData });
    } else {
      createMutation.mutate(sanitizedData);
    }
  };

  const handleDiscard = () => {
    form.reset();
    setOpen(false);
  };

  const loading = isLoading || isRolesLoading;

  return (
    <DrawerForm
      open={open}
      setOpen={setOpen}
      title={user ? "Edit User" : "Create User"}
      description={user ? "Edit user details" : "Create a new user"}
      isPreventInteractOutside={loading || isDirty}
      footer={
        <>
          <Button
            type="submit"
            form={formId}
            className="bg-blue-600 text-white py-2 px-4 rounded"
            disabled={loading || !isDirty}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="outline"
            className="py-2 px-4 rounded"
            onClick={() => handleDiscard()}
            disabled={loading || !isDirty}
          >
            Discard
          </Button>
        </>
      }
    >
      <UserForm
        formId={formId}
        form={form}
        onSubmit={handleSubmit}
        error={form.formState.errors?.root?.message}
        roles={roles}
      />
    </DrawerForm>
  );
}
