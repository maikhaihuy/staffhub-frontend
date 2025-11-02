import { sampleShifts, Shift } from "./types";
import axios from "@/lib/axios";

export const getShiftsByCurrentRole = async (): Promise<Shift[]> => sampleShifts;