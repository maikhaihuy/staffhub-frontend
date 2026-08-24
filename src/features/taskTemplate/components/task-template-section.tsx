import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import {
  useGetTaskTemplatesBySubShiftTemplate,
} from "../hooks/useTaskTemplateQueries";
import { useCreateTaskTemplate, useDeleteTaskTemplate } from "../hooks/useTaskTemplateMutations";
import { TASK_TEMPLATE_TYPE } from "../schemas";
import { TaskTemplate } from "../types";

type TaskTemplateSectionProps = {
  branchId: number;
  subShiftTemplateId: number;
};

const TASK_TYPE_LABEL: Record<TaskTemplate["type"], string> = {
  SHARED_MANDATORY: "Mandatory",
  SHARED_OPTIONAL: "Optional",
  DEDICATED: "Dedicated",
};

export default function TaskTemplateSection({
  branchId,
  subShiftTemplateId,
}: TaskTemplateSectionProps) {
  const { data: taskTemplates = [], isLoading } = useGetTaskTemplatesBySubShiftTemplate(
    branchId,
    subShiftTemplateId
  );
  const createMutation = useCreateTaskTemplate(branchId);
  const deleteMutation = useDeleteTaskTemplate(branchId);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<TaskTemplate["type"]>("SHARED_MANDATORY");

  const handleAdd = () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    createMutation.mutate(
      { branchId, subShiftTemplateId, title: trimmed, type },
      { onSuccess: () => setTitle("") }
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">Tasks</h3>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : taskTemplates.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tasks yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {taskTemplates.map((taskTemplate) => (
            <div
              key={taskTemplate.id}
              className="flex flex-row items-center justify-between rounded-md border p-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <span>{taskTemplate.title}</span>
                <Badge variant="outline">{TASK_TYPE_LABEL[taskTemplate.type]}</Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => deleteMutation.mutate(taskTemplate.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-row gap-2">
        <Input
          placeholder="Open register"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Select value={type} onValueChange={(value) => setType(value as TaskTemplate["type"])}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TASK_TEMPLATE_TYPE.map((t) => (
              <SelectItem key={t} value={t}>
                {TASK_TYPE_LABEL[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          onClick={handleAdd}
          disabled={createMutation.isPending || !title.trim()}
        >
          Add
        </Button>
      </div>
    </div>
  );
}
