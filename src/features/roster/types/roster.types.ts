import { z } from "zod";
import { createRosterSchema, rosterSchema, updateRosterSchema } from "../schemas/roster.schema";

export type Roster = z.infer<typeof rosterSchema>;
export type CreateRoster = z.infer<typeof createRosterSchema>;
export type UpdateRoster = z.infer<typeof updateRosterSchema>;