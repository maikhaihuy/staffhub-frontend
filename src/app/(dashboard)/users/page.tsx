"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RequireAbility } from "@/components/require-ability";
import UserDetail from "@/features/users/components/detail";
import UserList from "@/features/users/components/list";
import { User } from "@/features/users/types";
import { useDeleteUser } from "@/features/users/hooks/useUserMutations";
import { ColumnConfig } from "@/components/shared/generic-table";
import { Pen, PlusCircle, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

export default function UserPage() {
  const deleteMutation = useDeleteUser();

  const columns: ColumnConfig<User>[] = useMemo(
    () => [
      {
        key: "fullName",
        label: "Name",
        className: "w-2/8 font-medium",
      },
      {
        key: "phoneNumber",
        label: "Phone",
        className: "w-1/8 hidden md:table-cell",
      },
      {
        key: "roles",
        label: "Roles",
        className: "w-1/8 hidden md:table-cell",
        render: (user) => (
          <div className="flex flex-wrap gap-1">
            {user.roles.map((role) => (
              <Badge key={role.id} variant="outline" className="capitalize">
                {role.name}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        key: "status",
        label: "Status",
        className: "w-1/8",
        render: (user) => (
          <Badge variant={user.status === "ACTIVE" ? "default" : "secondary"}>
            {user.status}
          </Badge>
        ),
      },
      {
        key: "actions",
        label: "",
        className: "w-1/8 text-right",
        render: (user) => (
          <>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => {
                setSelectedUserId(user.id!);
                setOpen(true);
              }}
            >
              <Pen />
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (window.confirm(`Delete user "${user.fullName}"?`)) {
                  deleteMutation.mutate(user.id);
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

  const [selectedUserId, setSelectedUserId] = useState<number>(0);
  const [open, setOpen] = useState(false);

  return (
    <RequireAbility action="read" subject="users">
      <div className="flex flex-col gap-8">
        <div className="flex flex-row justify-between items-center">
          <div className="px-2 flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">Quản lý người dùng</h1>
            <div className="text-sm font-medium text-muted-foreground">
              Danh sách người dùng và phân quyền.
            </div>
          </div>
          <Button
            variant="outline"
            className="gap-1"
            onClick={() => {
              setSelectedUserId(0);
              setOpen(true);
            }}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Thêm mới
            </span>
          </Button>
        </div>
        <UserList columns={columns} />
        <UserDetail id={selectedUserId} open={open} setOpen={setOpen} />
      </div>
    </RequireAbility>
  );
}
