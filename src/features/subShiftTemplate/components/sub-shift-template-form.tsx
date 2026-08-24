import { SubShiftTemplateFormValues } from "../types";
import { SUB_SHIFT_TEMPLATE_TYPE } from "../schemas";
import { TimeRange } from "../utils/timeRange";
import SubShiftMiniTimelinePreview from "./mini-timeline-preview";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn, useWatch } from "react-hook-form";

const TYPE_LABEL: Record<(typeof SUB_SHIFT_TEMPLATE_TYPE)[number], string> = {
  MAIN: "Main",
  SUPPORT: "Support",
};

type SubShiftTemplateFormProps = {
  formId: string;
  form: UseFormReturn<SubShiftTemplateFormValues>;
  masterRange: TimeRange;
  onSubmit(data: SubShiftTemplateFormValues): void;
};

export default function SubShiftTemplateForm({
  formId,
  form,
  masterRange,
  onSubmit,
}: SubShiftTemplateFormProps) {
  const candidate = useWatch({ control: form.control });

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Main #1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SUB_SHIFT_TEMPLATE_TYPE.map((type) => (
                    <SelectItem key={type} value={type}>
                      {TYPE_LABEL[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubShiftMiniTimelinePreview
          masterRange={masterRange}
          candidate={{
            type: candidate.type ?? "MAIN",
            startTime: candidate.startTime ?? "",
            endTime: candidate.endTime ?? "",
          }}
        />
        <div className="flex flex-row gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Start time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>End time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="maxAssignments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max assignments</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value ? Number(e.target.value) : undefined)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
