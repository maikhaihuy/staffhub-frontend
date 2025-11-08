import { ROSTER_STATUS } from "@/constants";
import { sampleRosters, Roster } from "./types";

export const create = async (roster: Roster): Promise<Roster> => {
  console.log('create Roster, ', roster);
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return roster as Roster;
}

export const schedule = async (rosterId: number): Promise<Roster> => {
  console.log('schedule/unschedule roster, ', rosterId);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const rosters = sampleRosters;
  const newRoster = rosters.find(r => r.id === rosterId) || {} as Roster;

  const newStatus = newRoster.status === ROSTER_STATUS.PENDING ? ROSTER_STATUS.SCHEDULED : ROSTER_STATUS.PENDING;

  return {...newRoster, status: newStatus } as Roster;
}

export const update = async (rosterId: number, roster: Roster): Promise<Roster> => {
  console.log('update roster, ', roster);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const oldRoster = sampleRosters.find(r => r.id === rosterId);
  return { ...oldRoster, ...roster } as Roster;
}

export const remove = async (rosterId: number): Promise<number> => {
  console.log('delete roster, ', rosterId);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return rosterId;
}

export const getRostersByEmployee = async (employeeId: number): Promise<Roster[]> => {
  // console.log('fetch rosters by employee, ', employeeId);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log('sampleRosters', typeof sampleRosters[0].employeeId, typeof employeeId, sampleRosters[0].employeeId === employeeId);
  const rosters = sampleRosters.filter(r => r.employeeId === employeeId);
  console.log('rosters', rosters);
  return rosters;
}