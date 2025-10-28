import { sampleRosters, Roster } from "./types";
import axios from "@/lib/axios";

export const getRostersByCurrentWeek = async (branchId: number): Promise<Roster[]> => sampleRosters;