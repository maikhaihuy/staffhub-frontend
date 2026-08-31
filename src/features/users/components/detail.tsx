import { useGetUser } from "../hooks/useUserQueries";
import {
  useCreateUser,
  useUpdateUser,
  useAssignUserRoles,
  useRemoveUserRole,
  useAssignManagerBranches,
} from "../hooks/useUserMutations";
import { useGetRoles } from "@/features/roles/hooks/useRoleQueries";
import { useGetRolePermissionsForRoles } from "@/features/permissions/hooks/usePermissionQueries";
import { useGetBranches } from "@/features/branch/hooks/useBranchQueries";
import UserForm from "./form";
import { User, UserFormValues } from "../types";
import { userFormSchema } from "../schemas/user.schema";
import DrawerForm from "@/components/shared/drawer-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

type UserDetailProps = {
  id: number;
  open: boolean;
  setOpen: (open: boolean) => void;
};

// The backend returns `avatarUrl: null` (not omitted) when unset, which
// z.string().url().optional() rejects - normalize it to "" so the form can
// validate and the Input stays a controlled component.
function toFormValues(user: User): UserFormValues {
  return {
    ...user,
    avatarUrl: user.avatarUrl ?? "",
    roleIds: user.roles.map((r) => r.id),
  };
}

export default function UserDetail({ id, open, setOpen }: UserDetailProps) {
  const formId = "user-form";

  const { data: user, isLoading } = useGetUser(id);
  const { data: roles = [], isLoading: isRolesLoading } = useGetRoles();
  const { data: branches = [] } = useGetBranches();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: user ? toFormValues(user) : { status: "ACTIVE", roleIds: [] },
  });
  const {
    formState: { isDirty },
  } = form;

  const selectedRoleIds = form.watch("roleIds") ?? [];

  // A role "resolves to Manager-scoped" if any of its grants carry a
  // condition using the $managedBranches token (design.md's decision;
  // tasks.md 6.3) - checked against the real grants, not the role's name.
  const { grants: selectedRoleGrants } = useGetRolePermissionsForRoles(selectedRoleIds);
  const requiresManagedBranches = useMemo(
    () => selectedRoleGrants.some((g) => JSON.stringify(g.condition ?? "").includes("$managedBranches")),
    [selectedRoleGrants]
  );

  // No GET endpoint exists yet for a user's currently-managed branches
  // (tasks.md 6.3 note) - this only tracks branches picked in this session,
  // it can't show what's already assigned.
  const [pendingManagedBranchIds, setPendingManagedBranchIds] = useState<number[]>([]);

  // Reset form when userData changes (for edit)
  useEffect(() => {
    if (user) {
      form.reset(toFormValues(user));
    } else {
      form.reset({
        fullName: "",
        phoneNumber: "",
        avatarUrl: "",
        status: "ACTIVE",
        roleIds: [],
      });
    }
    setPendingManagedBranchIds([]);
  }, [user, form]);

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const assignRolesMutation = useAssignUserRoles();
  const removeRoleMutation = useRemoveUserRole();
  const assignManagerBranchesMutation = useAssignManagerBranches();

  const handleSubmit = async (data: UserFormValues) => {
    const sanitizedData = {
      ...data,
      fullName: data.fullName.trim(),
      phoneNumber: data.phoneNumber.trim(),
      avatarUrl: data.avatarUrl?.trim() || undefined,
    };

    if (user && user.id) {
      const { roleIds: nextRoleIds, ...baseFields } = sanitizedData;
      await updateMutation.mutateAsync({ id: user.id, ...baseFields });

      const currentRoleIds = user.roles.map((r) => r.id);
      const toAdd = nextRoleIds.filter((rid) => !currentRoleIds.includes(rid));
      const toRemove = currentRoleIds.filter((rid) => !nextRoleIds.includes(rid));

      if (toAdd.length > 0) {
        await assignRolesMutation.mutateAsync({ userId: user.id, roleIds: toAdd });
      }
      for (const roleId of toRemove) {
        await removeRoleMutation.mutateAsync({ userId: user.id, roleId });
      }

      if (pendingManagedBranchIds.length > 0) {
        await assignManagerBranchesMutation.mutateAsync({
          userId: user.id,
          branchIds: pendingManagedBranchIds,
        });
      }
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
            disabled={loading || (!isDirty && pendingManagedBranchIds.length === 0)}
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
      {user && requiresManagedBranches && (
        <div className="flex flex-col gap-2 mt-4">
          <Label>Managed branches</Label>
          <p className="text-sm text-muted-foreground">
            One of this user&apos;s roles grants access scoped to
            &quot;managed branches only&quot;. There&apos;s no way yet to
            read back which branches are already assigned (the backend has
            no GET endpoint for it) - branches checked here are added on
            save, in addition to whatever is already assigned.
          </p>
          <div className="flex flex-col gap-2 rounded-md border p-3">
            {branches.map((branch) => {
              const checked = pendingManagedBranchIds.includes(branch.id);
              return (
                <div key={branch.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`managed-branch-${branch.id}`}
                    checked={checked}
                    onCheckedChange={(next) =>
                      setPendingManagedBranchIds((prev) =>
                        next
                          ? [...prev, branch.id]
                          : prev.filter((bid) => bid !== branch.id)
                      )
                    }
                  />
                  <Label htmlFor={`managed-branch-${branch.id}`} className="font-normal">
                    {branch.name}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </DrawerForm>
  );
}
