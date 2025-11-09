"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BrancDetail from "@/features/branch/components/detail";
import BranchList from "@/features/branch/components/list";
import { Branch } from "@/features/branch/types";
import { ColumnConfig } from "@/types/interface";
import { Pen, PlusCircle, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

export default function BranchPage() {
  const columns: ColumnConfig<Branch>[] = useMemo(
    () => [
      {
        key: "name",
        label: "Name",
        className: "w-2/8 font-medium",
      },
      {
        key: "abbreviation",
        label: "Abbreviation",
        className: "w-1/8",
        render: (branch) => (
          <Badge variant="outline" className="capitalize">
            {branch.abbreviation}
          </Badge>
        ),
      },
      {
        key: "email",
        label: "Email",
        className: "w-1/8 hidden md:table-cell",
      },
      {
        key: "phone",
        label: "Phone",
        className: "w-1/8 hidden md:table-cell",
      },
      {
        key: "address",
        label: "Address",
        className: "w-2/8 hidden md:table-cell",
      },
      {
        key: "actions",
        label: "",
        className: "w-1/8 text-right",
        render: (branch) => (
          <>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => {
                setSelectedBranchId(branch.id!);
                setOpen(true);
              }}
            >
              <Pen />
            </Button>
            <Button variant="ghost">
              <Trash2 />
            </Button>
          </>
        ),
      },
    ],
    []
  );

  const [selectedBranchId, setSelectedBranchId] = useState<number>(0);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-row justify-between items-center">
        <div className="px-2 flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Quản lý chi nhánh</h1>
          <div className="text-sm font-medium text-muted-foreground">
            Danh sách chi nhánh. Thiết lập phân trang và lọc để tìm kiếm nhanh
            hơn.
          </div>
        </div>
        <Button
          variant="outline"
          className="gap-1"
          onClick={() => {
            setSelectedBranchId(0);
            setOpen(true);
          }}
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Thêm mới
          </span>
        </Button>
      </div>
      <BranchList columns={columns} />
      <BrancDetail id={selectedBranchId} open={open} setOpen={setOpen} />
    </div>
  );
}
