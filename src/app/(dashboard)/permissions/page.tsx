"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RequireAbility } from "@/components/require-ability";
import PermissionDetail from "@/features/permissions/components/detail";
import PermissionList from "@/features/permissions/components/list";
import { Permission } from "@/features/permissions/types";
import { useDeletePermission } from "@/features/permissions/hooks/usePermissionMutations";
import { ColumnConfig } from "@/components/shared/generic-table";
import { Pen, PlusCircle, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

export default function PermissionsPage() {
  const deleteMutation = useDeletePermission();

  const columns: ColumnConfig<Permission>[] = useMemo(
    () => [
      {
        key: "subject",
        label: "Subject",
        className: "w-2/8 font-medium",
      },
      {
        key: "action",
        label: "Action",
        className: "w-1/8",
        render: (permission) => (
          <Badge variant="outline">{permission.action}</Badge>
        ),
      },
      {
        key: "description",
        label: "Description",
        className: "w-3/8 hidden md:table-cell",
      },
      {
        key: "roles",
        label: "Roles",
        className: "w-1/8",
        render: (permission) => permission.roles?.length ?? 0,
      },
      {
        key: "actions",
        label: "",
        className: "w-1/8 text-right",
        render: (permission) => (
          <>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => {
                setSelectedPermissionId(permission.id);
                setOpen(true);
              }}
            >
              <Pen />
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (
                  window.confirm(
                    `Delete permission "${permission.action}:${permission.subject}"?`
                  )
                ) {
                  deleteMutation.mutate(permission.id);
                }
              }}
            >
              <Trash2 />
            </Button>
          </>
        ),
      },
    ],
    [deleteMutation]
  );

  const [selectedPermissionId, setSelectedPermissionId] = useState<number>(0);
  const [open, setOpen] = useState(false);

  return (
    <RequireAbility action="read" subject="permissions">
      <div className="flex flex-col gap-8">
        <div className="flex flex-row justify-between items-center">
          <div className="px-2 flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">Permissions</h1>
            <div className="text-sm font-medium text-muted-foreground">
              Manage the action + subject permission catalog.
            </div>
          </div>
          <Button
            variant="outline"
            className="gap-1"
            onClick={() => {
              setSelectedPermissionId(0);
              setOpen(true);
            }}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add permission
            </span>
          </Button>
        </div>
        <PermissionList columns={columns} />
        <PermissionDetail
          id={selectedPermissionId}
          open={open}
          setOpen={setOpen}
        />
      </div>
    </RequireAbility>
  );
}
