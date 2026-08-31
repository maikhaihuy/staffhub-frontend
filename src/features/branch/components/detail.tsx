import { useGetBranch } from "../hooks/useBranchQueries";
import { useCreateBranch, useUpdateBranch } from "../hooks/useBranchMutations";
import BranchForm from "./form";
import { BranchFormValues } from "../types";
import { branchFormSchema } from "../schemas";
import DrawerForm from "@/components/shared/drawer-form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type BranchDetailProps = {
  id: number;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function BrancDetail({ id, open, setOpen }: BranchDetailProps) {
  const formId = "branch-form";

  const { data: branch, isLoading } = useGetBranch(id);

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: branch || {},
  });
  const {
    formState: { isDirty },
  } = form;

  // Reset form when branchData changes (for edit)
  useEffect(() => {
    if (branch) {
      form.reset(branch);
    } else {
      form.reset({
        name: "",
        abbreviation: "",
        address: "",
        phone: "",
        email: "",
      });
    }
  }, [branch, form]);

  const createMutation = useCreateBranch(form);
  const updateMutation = useUpdateBranch(form);

  const handleSubmit = (data: BranchFormValues) => {
    // Sanitize and trim input values before mutation
    const sanitizedData = {
      ...data,
      name: data.name.trim(),
      abbreviation: data.abbreviation.trim(),
      address: data.address?.replace(/[<>]/g, "").trim(),
      phone: data.phone?.replace(/[^0-9+()-\s]/g, "").trim(),
      email: data.email?.trim().toLowerCase(),
    };

    if (branch && branch.id) {
      updateMutation.mutate({ id: branch.id, ...sanitizedData });
    } else {
      createMutation.mutate(sanitizedData);
    }
  };

  const handleDiscard = () => {
    form.reset();
    setOpen(false);
  };

  return (
    <DrawerForm
      open={open}
      setOpen={setOpen}
      title={branch ? "Edit Branch" : "Create Branch"}
      description={branch ? "Edit branch details" : "Create a new branch"}
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
      <BranchForm
        formId={formId}
        form={form}
        onSubmit={handleSubmit}
        error={form.formState.errors?.root?.message}
      />
    </DrawerForm>
  );
}
