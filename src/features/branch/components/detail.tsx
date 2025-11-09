import { branchService } from "../services/branch.service";
import BranchForm from "./form";
import { Branch, branchSchema } from "../types";
import DrawerForm from "@/components/organisms/drawer-form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type BranchDetailProps = {
  id: number;
  open: boolean;
  // eslint-disable-next-line no-unused-vars
  setOpen: (open: boolean) => void;
};

export default function BrancDetail({ id, open, setOpen }: BranchDetailProps) {
  const queryClient = useQueryClient();
  const formId = "branch-form";

  const { data: branch, isLoading } = useQuery({
    queryKey: ["branch", id],
    queryFn: () => branchService.getBranch(id),
    enabled: !!id,
  });

  const form = useForm<Branch>({
    resolver: zodResolver(branchSchema),
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

  const mutation = useMutation({
    mutationFn: (data: Branch) =>
      branch && branch.id ? branchService.update(branch.id, data) : branchService.create(data),
    onSuccess: (d) => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      form.reset(d as Branch); // Reset form to new data here
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
    mutation.mutate(sanitizedData);
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
