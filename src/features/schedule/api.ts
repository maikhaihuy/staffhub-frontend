import { ROSTER_STATUS, SCHEDULE_STATUS } from "@/constants";
import { Schedule, ScheduleWithRosters, sampleSchedulesWithRosters } from "./types";
import { Roster } from "../roster/types";

export const getSchedulesByCurrentWeek = async (branchId: number): Promise<ScheduleWithRosters[]> => {
  console.log('ferch scheduels include rosters, ', branchId);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return sampleSchedulesWithRosters();
}

export const create = async (schedule: Schedule): Promise<ScheduleWithRosters> => {
  console.log('create scheduel, ', schedule);
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {...schedule, rosters: []} as ScheduleWithRosters;
}

export const publish = async (scheduleId: number): Promise<ScheduleWithRosters> => {
  console.log('publish/unpublish scheduels include rosters, ', scheduleId);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const schedules = sampleSchedulesWithRosters();
  const newSchedule = schedules.find(s => s.id === scheduleId) || {} as ScheduleWithRosters

  const newStatus = newSchedule.status === SCHEDULE_STATUS.DRAFT ? SCHEDULE_STATUS.PUBLISHED : SCHEDULE_STATUS.DRAFT;
  const newRosters = newSchedule.rosters.map((roster) => ({
    id: roster.id,
    scheduleId: roster.scheduleId,
    employeeId: roster.employeeId,
    actualDate: roster.actualDate,
    actualStartAt: roster.actualStartAt,
    actualEndAt: roster.actualEndAt,
    status: newStatus === SCHEDULE_STATUS.PUBLISHED ? (roster.status === ROSTER_STATUS.PENDING ? ROSTER_STATUS.REJECTED : roster.status) : (roster.status === ROSTER_STATUS.REJECTED ? ROSTER_STATUS.PENDING : roster.status),
    mode: roster.mode,
    note: roster.note,
  } as Roster));

  return {...newSchedule, status: newStatus, rosters: newRosters} as ScheduleWithRosters;
}

export const update = async (scheduleId: number, schedule: Schedule): Promise<ScheduleWithRosters> => {
  console.log('update scheduel, ', schedule);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const schedules = sampleSchedulesWithRosters();
  const newSchedule = schedules.find(s => s.id === scheduleId);
  return { ...newSchedule, ...schedule } as ScheduleWithRosters;
}