import { z } from "zod";
import {
  taskTemplateSchema,
  taskTemplateFormSchema,
  createTaskTemplateSchema,
  updateTaskTemplateSchema,
} from "../schemas";

export type TaskTemplate = z.infer<typeof taskTemplateSchema>;
export type TaskTemplateFormValues = z.infer<typeof taskTemplateFormSchema>;
export type CreateTaskTemplateDTO = z.infer<typeof createTaskTemplateSchema>;
export type UpdateTaskTemplateDTO = z.infer<typeof updateTaskTemplateSchema>;
export type UpdateTaskTemplateInput = UpdateTaskTemplateDTO & { id: number };
