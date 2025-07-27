import { Branch } from "../branch/types";
import { Employee } from "./types";
import { Input } from "@/components/ui";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { AlertCircleIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

type EmployeeFormProps = {
  formId: string;
  form: UseFormReturn<Employee>;
  onSubmit(data: Employee): void;
  error?: string;
  branches: Branch[];
};

export default function EmployeeForm({
  formId,
  form,
  onSubmit,
  error,
  branches,
}: EmployeeFormProps) {
  // avatar: z.string().optional(),
  //   status: z.enum(['active', 'inactive']).default('active'),
  //   level: z.number().min(0, 'Level must be a positive number').default(0),
  //   branch: z.string().optional(),
  //   availableAt: z.string().optional(),
  //   name: z.string().min(1, 'Name is required'),
  //   email: z.string().email('Invalid email'),
  //   role: z.enum(['employee', 'admin'])
  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              <p>{error}</p>
            </AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Danh xưng</FormLabel>
              <FormControl>
                <Input placeholder="Pé Un" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số điện thoại</FormLabel>
              <FormControl>
                <Input placeholder="0987654321" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="branchIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chi nhánh</FormLabel>
              <div className="flex flex-col gap-2">
                {branches.map((branch) => (
                  <FormItem
                    key={branch.id}
                    className="flex flex-row items-center gap-2"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(branch.id!)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...(field.value || []), branch.id]);
                          } else {
                            field.onChange(
                              (field.value || []).filter(
                                (id) => id !== branch.id
                              )
                            );
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      <Badge variant="outline" className="capitalize">
                        {branch.abbreviation}
                      </Badge>
                      {branch.name}
                    </FormLabel>
                  </FormItem>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
