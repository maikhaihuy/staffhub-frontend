"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { getBranches } from "@/features/branch/api";
import BranchForm from "@/features/branch/form";
import BranchList from "@/features/branch/list";
import { Branch } from "@/features/branch/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pen, PlusCircle, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

type ColumnConfig<T> = {
  key: keyof T | string;
  label: string;
  className?: string;
  render?: (item: T) => React.ReactNode;
};

type DrawerFormProp = {
  id: number;
  open: boolean;
  onSuccess: (data: Branch) => void;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
};

function DrawerForm({
  id,
  open,
  onSuccess,
  onOpenChange,
  onClose,
}: DrawerFormProp) {
  const isMobile = useIsMobile();
  if (!open) return;

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={onOpenChange}
    >
      <DrawerContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DrawerHeader className="gap-1">
          <DrawerTitle>{!id ? "Thêm mới" : "Chỉnh sửa"}</DrawerTitle>
          <DrawerDescription>Thông tin chi nhánh</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <BranchForm branchId={id} onSuccess={onSuccess} />
        </div>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline" onClick={onClose}>
              Done
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default function BranchPage() {
  const queryClient = useQueryClient();
  const [pageSize, setPageSize] = useState(2);
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["branches", page, pageSize],
    queryFn: () => getBranches(page, pageSize),
  });

  const columns: ColumnConfig<Branch>[] = useMemo(
    () => [
      {
        key: "name",
        label: "Name",
        className: "font-medium",
      },
      {
        key: "abbreviation",
        label: "Abbreviation",
        render: (branch) => (
          <Badge variant="outline" className="capitalize">
            {branch.abbreviation}
          </Badge>
        ),
      },
      {
        key: "email",
        label: "Email",
        className: "hidden md:table-cell",
      },
      {
        key: "phone",
        label: "Phone",
        className: "hidden md:table-cell",
      },
      {
        key: "address",
        label: "Address",
        className: "hidden md:table-cell",
      },
      {
        key: "actions",
        label: "",
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

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedBranchId(0);
    }
    console.log("open", open);
    console.log("selectedBranchId", selectedBranchId);
  };
  const onSuccess = (d: Branch) => {
    console.log("onSuccess", d);
    queryClient.invalidateQueries({ queryKey: ["branches"] });
    // Optionally, you can refetch branches here
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <div className="flex items-center">
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" className="h-8 gap-1" onClick={() => setOpen(true)}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Thêm
            </span>
          </Button>
        </div>
      </div>
      <BranchList
        branches={data?.data ?? []}
        columns={columns}
        page={page}
        pageSize={pageSize}
        total={data?.total ?? 0}
        setPage={(value) => {
          console.log("setPage: branch page ", value);
          //queryClient.invalidateQueries({ queryKey: ["branches"], value });
          setPage(value);
        }}
        setPageSize={(value) => {
          console.log("setPageSize: branch page ", value);
          setPageSize(value);
        }}
      />
      <DrawerForm
        id={selectedBranchId}
        open={open}
        onSuccess={onSuccess}
        onOpenChange={handleOpenChange}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
