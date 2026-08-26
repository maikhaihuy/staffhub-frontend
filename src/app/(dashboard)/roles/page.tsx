"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RequireAbility } from "@/components/require-ability";
import RoleDetail from "@/features/roles/components/detail";
import RoleList from "@/features/roles/components/list";
import { Role } from "@/features/roles/types";
import { useDeleteRole } from "@/features/roles/hooks/useRoleMutations";
import { useGetUsers } from "@/features/users/hooks/useUserQueries";
import { ColumnConfig } from "@/components/shared/generic-table";
import { Pen, PlusCircle, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function RolesPage() {
  const router = useRouter();
  const deleteMutation = useDeleteRole();
  const { data: users = [] } = useGetUsers();

  const columns: ColumnConfig<Role>[] = useMemo(
    () => [
      {
        key: "name",
        label: "Name",
        className: "w-2/8 font-medium",
        render: (role) => (
          <div className="flex items-center gap-2">
            {role.name}
            {role.isSystemRole && <Badge variant="secondary">System</Badge>}
          </div>
        ),
      },
      {
        key: "description",
        label: "Description",
        className: "w-3/8 hidden md:table-cell",
      },
      {
        key: "permissions",
        label: "Permissions",
        className: "w-1/8",
        render: (role) => role.permissions?.length ?? 0,
      },
      {
        key: "users",
        label: "Users",
        className: "w-1/8",
        render: (role) =>
          users.filter((u) => u.roles.some((r) => r.id === role.id)).length,
      },
      {
        key: "actions",
        label: "",
        className: "w-2/8 text-right",
        render: (role) => (
          <>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => router.push(`/roles/${role.id}`)}
              title="Manage permissions"
            >
              <ShieldCheck />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => {
                setSelectedRoleId(role.id);
                setOpen(true);
              }}
            >
              <Pen />
            </Button>
            {role.isSystemRole ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button variant="ghost" disabled>
                      <Trash2 />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>System roles cannot be deleted</TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="ghost"
                onClick={() => {
                  if (window.confirm(`Delete role "${role.name}"?`)) {
                    deleteMutation.mutate(role.id);
                  }
                }}
              >
                <Trash2 />
              </Button>
            )}
          </>
        ),
      },
    ],
    [deleteMutation, router, users]
  );

  const [selectedRoleId, setSelectedRoleId] = useState<number>(0);
  const [open, setOpen] = useState(false);

  return (
    <RequireAbility action="read" subject="roles">
      <div className="flex flex-col gap-8">
        <div className="flex flex-row justify-between items-center">
          <div className="px-2 flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">Roles</h1>
            <div className="text-sm font-medium text-muted-foreground">
              Manage roles and their permission grants.
            </div>
          </div>
          <Button
            variant="outline"
            className="gap-1"
            onClick={() => {
              setSelectedRoleId(0);
              setOpen(true);
            }}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add role
            </span>
          </Button>
        </div>
        <RoleList columns={columns} />
        <RoleDetail id={selectedRoleId} open={open} setOpen={setOpen} />
      </div>
    </RequireAbility>
  );
}
