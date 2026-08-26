"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RequireAbility } from "@/components/require-ability";
import EmployeeDetail from "@/features/employee/components/detail";
import EmployeeList from "@/features/employee/components/list";
import { Employee } from "@/features/employee/types";
import { useDeleteEmployee } from "@/features/employee/hooks/useEmployeeMutations";
import { ColumnConfig } from "@/components/shared/generic-table";
import { Pen, PlusCircle, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

export default function EmployeePage() {
  const deleteMutation = useDeleteEmployee();

  const columns: ColumnConfig<Employee>[] = useMemo(
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
        key: "branchIds",
        label: "Chi nhánh",
        className: "w-2/8 hidden md:table-cell",
        render: (employee) => (
          <div className="flex flex-col gap-1">
            {(employee.branches ?? []).map((branch) => (
              <Badge key={branch.id} variant="outline" className="capitalize">
                Branch {branch.name}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        key: "actions",
        label: "",
        className: "w-1/8 text-right",
        render: (employee) => (
          <>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => {
                setSelectedEmployeeId(employee.id!);
                setOpen(true);
              }}
            >
              <Pen />
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (window.confirm(`Delete employee "${employee.fullName}"?`)) {
                  deleteMutation.mutate(employee.id);
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

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(0);
  const [open, setOpen] = useState(false);

  return (
    <RequireAbility action="read" subject="employees">
    <div className="flex flex-col gap-8">
      <div className="flex flex-row justify-between items-center">
        <div className="px-2 flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Quản lý nhân viên</h1>
          <div className="text-sm font-medium text-muted-foreground">
            Danh sách nhân viên. Thiết lập phân trang và lọc để tìm kiếm nhanh
            hơn.
          </div>
        </div>
        <Button
          variant="outline"
          className="gap-1"
          onClick={() => {
            setSelectedEmployeeId(0);
            setOpen(true);
          }}
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Thêm mới
          </span>
        </Button>
      </div>
      <EmployeeList columns={columns} />
      <EmployeeDetail id={selectedEmployeeId} open={open} setOpen={setOpen} />
    </div>
    </RequireAbility>
  );
}
