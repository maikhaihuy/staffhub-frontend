import { createBranch, updateBranch, getBranch } from "./api";
import { Branch, branchSchema } from "./types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircleIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type BranchFormProps = {
  branchId: number; // If provided, form is in edit mode
  onSuccess?: (d: Branch) => void; // Optional callback after successful submit
};

export default function BranchForm({ branchId, onSuccess }: BranchFormProps) {
  const { data: branchData } = useQuery({
    queryKey: ["branch", branchId],
    queryFn: () => getBranch(branchId),
    enabled: !!branchId,
  });
  const form = useForm<Branch>({
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
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form;

  useEffect(() => {
    if (branchData) {
      reset({
        ...branchData,
        address: branchData.address ?? "",
        phone: branchData.phone ?? "",
        email: branchData.email ?? "",
      });
    }
  }, [branchData, reset]);

  const mutation = useMutation({
    mutationFn: (data: Branch) =>
      branchData && branchData.id ? updateBranch(data) : createBranch(data),
    onSuccess: (d) => {
      reset();
      onSuccess?.(d);
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit((data) => {
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
        })}
        className="bg-white p-4 rounded shadow"
      >
        {mutation.isError && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              <p>{mutation.error.message}</p>
            </AlertDescription>
          </Alert>
        )}
        {JSON.stringify(errors)}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Name" {...field} />
              </FormControl>
              <FormDescription>Name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="abbreviation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Abbreviation</FormLabel>
              <FormControl>
                <Input placeholder="Abbreviation" {...field} />
              </FormControl>
              <FormDescription>Abbreviation</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Address" {...field} />
              </FormControl>
              <FormDescription>Address</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="Phone" {...field} />
              </FormControl>
              <FormDescription>Phone</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" {...field} />
              </FormControl>
              <FormDescription>Email</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded"
          disabled={mutation.isPending || !isDirty}
        >
          {mutation.isPending ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
}
