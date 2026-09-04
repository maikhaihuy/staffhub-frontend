import { useGetEmployee } from "../hooks/useEmployeeQueries";
import { useCreateEmployee, useUpdateEmployee } from "../hooks/useEmployeeMutations";
import { useGetBranches } from "../../branch/hooks/useBranchQueries";
import EmployeeForm from "./form";
import { EmployeeFormValues } from "../types";
import { employeeFormSchema } from "../schemas/employee.schema";
import DrawerForm from "@/components/shared/drawer-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckIcon, CopyIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type EmployeeDetailProps = {
  id: number;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function EmployeeDetail({ id, open, setOpen }: EmployeeDetailProps) {
  const formId = "employee-form";

  const { data: employee, isLoading } = useGetEmployee(id);
  const { data: branches = [], isLoading: isBranchesLoading } = useGetBranches();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: employee || { branchIds: [] },
  });
  const {
    formState: { isDirty },
  } = form;

  // Reset form when employeeData changes (for edit)
  useEffect(() => {
    if (employee) {
      form.reset(employee);
    } else {
      form.reset({
        fullName: "",
        phoneNumber: "",
        branchIds: [],
      });
    }
  }, [employee, form]);

  const createMutation = useCreateEmployee(form);
  const updateMutation = useUpdateEmployee(form);

  // The temporary password is returned exactly once, in the create
  // response - it's never sent to the employee automatically yet, so it's
  // held here just long enough for an admin to copy it out.
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (data: EmployeeFormValues) => {
    const sanitizedData = {
      ...data,
      fullName: data.fullName.trim(),
      phoneNumber: data.phoneNumber.replace(/[^0-9+()-\s]/g, "").trim(),
    };

    if (employee && employee.id) {
      updateMutation.mutate({ id: employee.id, ...sanitizedData });
    } else {
      createMutation.mutate(sanitizedData, {
        onSuccess: (created) => {
          setOpen(false);
          if (created.temporaryPassword) {
            setTempPassword(created.temporaryPassword);
          }
        },
      });
    }
  };

  const handleCopyTempPassword = async () => {
    if (!tempPassword) return;
    await navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    toast.success("Đã sao chép mật khẩu tạm thời");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDiscard = () => {
    form.reset();
    setOpen(false);
  };

  const loading = isLoading || isBranchesLoading;

  return (
    <>
      <DrawerForm
        open={open}
        setOpen={setOpen}
        title={employee ? "Edit Employee" : "Create Employee"}
        description={employee ? "Edit employee details" : "Create a new employee"}
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
        <EmployeeForm
          formId={formId}
          form={form}
          onSubmit={handleSubmit}
          error={form.formState.errors?.root?.message}
          branches={branches}
        />
      </DrawerForm>

      <Dialog open={tempPassword !== null} onOpenChange={(open) => !open && setTempPassword(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mật khẩu tạm thời</DialogTitle>
            <DialogDescription>
              Sao chép mật khẩu này và gửi cho nhân viên. Mật khẩu sẽ không hiển thị lại sau khi
              đóng hộp thoại này.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input readOnly value={tempPassword ?? ""} className="font-mono" />
            <Button type="button" variant="outline" size="icon" onClick={handleCopyTempPassword}>
              {copied ? <CheckIcon /> : <CopyIcon />}
            </Button>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setTempPassword(null)}>
              Đã sao chép
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
