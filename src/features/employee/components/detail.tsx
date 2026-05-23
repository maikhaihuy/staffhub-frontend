import { useGetBranchesWithPaging } from "../../branch/hooks/useBranchQueries";
import { create, getEmployee, update } from "../services/employee.service";
import EmployeeForm from "./form";
import { Employee } from "../types/employee.types";
import { employeeSchema } from "../schemas/employee.schema";
import DrawerForm from "@/components/shared/drawer-form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type EmployeeDetailProps = {
  id: number;
  open: boolean;
  // eslint-disable-next-line no-unused-vars
  setOpen: (open: boolean) => void;
};

export default function BrancDetail({
  id,
  open,
  setOpen,
}: EmployeeDetailProps) {
  const queryClient = useQueryClient();
  const formId = "employee-form";

  const { data: employee, isLoading } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => getEmployee(id),
    enabled: !!id,
  });

  const { data: branchesData, isLoading: isBranchesLoading } = useGetBranchesWithPaging({ all: true });
  const branches = Array.isArray(branchesData) ? branchesData : (branchesData as { data: Branch[] })?.data || [];

  const form = useForm<Employee>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee || {},
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
        name: "",
        phone: "",
        branchIds: [],
      });
    }
  }, [employee, form]);

  const mutation = useMutation({
    mutationFn: (data: Employee) =>
      employee && employee.id ? update(employee.id, data) : create(data),
    onSuccess: (d) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      form.reset(d); // Reset form to new data here
      console.log("data submit: ", d);
    },
    onError(error: Error) {
      console.error("Error submitting employee data:", error);
      form.setError("root", { message: error.message });
    },
  });

  const handleSubmit = (data: Employee) => {
    console.log(data);
    // Sanitize and trim input values before mutation
    const sanitizedData = {
      ...data,
      name: data.name.trim(),
      phone: data.phone.replace(/[^0-9+()-\s]/g, "").trim(),
    };
    mutation.mutate(sanitizedData);
  };
  const handleDiscard = () => {
    form.reset();
    setOpen(false);
  };
  if (isLoading || isBranchesLoading) {
    return <p>Loading...</p>;
  }
  return (
    <DrawerForm
      open={open}
      setOpen={setOpen}
      title={employee ? "Edit Employee" : "Create Employee"}
      description={employee ? "Edit employee details" : "Create a new employee"}
      isPreventInteractOutside={isLoading || isDirty}
      footer={
        <>
          <Button
            type="submit"
            form={formId}
            className="bg-blue-600 text-white py-2 px-4 rounded"
            disabled={isLoading || !isDirty}
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="outline"
            className="py-2 px-4 rounded"
            onClick={() => handleDiscard()}
            disabled={isLoading || !isDirty}
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
        branches={Array.isArray(branches) ? branches : branches.data || []}
      />
    </DrawerForm>
  );
}
