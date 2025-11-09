import { z } from "zod";
import { scheduleSchema, createScheduleSchema, updateScheduleSchema, scheduleWithRostersSchema } from "../schemas/schedule.schema";

export type Schedule = z.infer<typeof scheduleSchema>;
export type CreateSchedule = z.infer<typeof createScheduleSchema>;
export type UpdateSchedule = z.infer<typeof updateScheduleSchema>;
export type ScheduleWithRosters = z.infer<typeof scheduleWithRostersSchema>;