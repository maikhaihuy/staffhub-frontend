"use client";

import DrawerForm from "@/components/organisms/drawer-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  createBranch,
  getBranch,
  getBranches,
  updateBranch,
} from "@/features/branch/api";
import BranchForm from "@/features/branch/form";
import BranchList from "@/features/branch/list";
import { Branch, branchSchema } from "@/features/branch/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pen, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

type ColumnConfig<T> = {
  key: keyof T | string;
  label: string;
  className?: string;
  render?: (item: T) => React.ReactNode;
};

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

  // Only fetch branch detail when drawer is open and branchId is set
  const { data: branchData } = useQuery({
    queryKey: ["branch", selectedBranchId],
    queryFn: () => getBranch(selectedBranchId!),
    enabled: !!selectedBranchId && open,
  });

  const branchForm = useForm<Branch>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: "",
      abbreviation: "",
      address: "",
      phone: "",
      email: "",
    },
  });
  const {
    formState: { isDirty },
  } = branchForm;
  // Reset form when branchData changes (for edit)
  useEffect(() => {
    if (branchData) {
      branchForm.reset(branchData);
    } else {
      branchForm.reset({
        name: "",
        abbreviation: "",
        address: "",
        phone: "",
        email: "",
      });
    }
  }, [branchData, branchForm]);

  const mutation = useMutation({
    mutationFn: (data: Branch) =>
      branchData && branchData.id ? updateBranch(data) : createBranch(data),
    onSuccess: (d) => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      setSelectedBranchId(d.id!);
      branchForm.reset(d); // Reset form to new data here
      console.log("data submit: ", d);
    },
  });

  const handleSubmit = (data: Branch) => {
    console.log(data);
    // Sanitize and trim input values before mutation
    const sanitizedData = {
      ...data,
      name: data.name.trim(),
      abbreviation: data.abbreviation.trim(),
      address: data.address?.replace(/[<>]/g, "").trim(),
      phone: data.phone?.replace(/[^0-9+()-\s]/g, "").trim(),
      email: data.email?.trim().toLowerCase(),
    };
    console.log("sumbit");
    mutation.mutate(sanitizedData);
  };
  const handleDiscard = () => {
    branchForm.reset();
    setOpen(false);
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
        title="Chi nhánh"
        description="Thông tin chi tiết các chi nhánh"
        data={data?.data ?? []}
        columns={columns}
        page={page}
        pageSize={pageSize}
        total={data?.total ?? 0}
        setPage={setPage}
        setPageSize={setPageSize}
      />
      <DrawerForm
        open={open}
        setOpen={setOpen}
        onOpenChange={handleOpenChange}
        onDiscard={handleDiscard}
        isDirty={isDirty}
        isLoading={mutation.isPending}
        formId="branch-form"
        title={!selectedBranchId ? "Thêm mới" : "Chỉnh sửa"}
        description="Thông tin chi nhánh"
      >
        <BranchForm
          formId="branch-form"
          form={branchForm}
          onSubmit={handleSubmit}
        />
      </DrawerForm>
    </div>
  );
}
