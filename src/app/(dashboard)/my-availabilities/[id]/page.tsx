"use client";

import ScheduleTable from "./employeeScheduleView/scheduleTable";
import { Schedule } from "@/features/schedule/types";
import { useGetBranchesWithSchedulesByEmployee } from "@/hooks/useBranches";
import { useGetRostersByEmployee } from "@/hooks/useRosters";
import { generateWeekdays, getTime } from "@/utils/dateTimeHelpers";
import React, { useMemo } from "react";
import { use } from "react";
import { Loader2 } from "lucide-react";

interface MyAvailabilityPageProps {
  params: Promise<{ id: number }>;
}

export default function MyAvailabilityPage({
  params,
}: MyAvailabilityPageProps) {
  const { id } = use(params);
  const employeeId = id;
  const weekDays = generateWeekdays(new Date("2025-10-13"));

  const { data: rosterByEmployee, isLoading: isFetchingRoster } =
    useGetRostersByEmployee(+employeeId);

  const { data: branch, isLoading: isFetchingBranch } =
    useGetBranchesWithSchedulesByEmployee(+employeeId);

    // Group schedules by name and time range
    const scheduleGroups = useMemo(() => {
      if (!branch) return {}
      return branch.schedules.reduce((acc, schedule) => {
      const key = `${schedule.name}_${getTime(schedule.startTime)}-${getTime(
        schedule.endTime
      )}`;
      if (!acc[key]) {
        acc[key] = {
          name: schedule.name,
          timeRange: `${getTime(schedule.startTime)}-${getTime(
            schedule.endTime
          )}`,
          schedules: [],
        };
      }
      acc[key].schedules.push(schedule);
      return acc;
    }, {} as Record<string, { name: string; timeRange: string; schedules: Schedule[] }>);
    }, [branch]);

  return (isFetchingRoster || isFetchingBranch) ? (
    <div className="flex items-center justify-center h-1/2">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ) : (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">My Availability</h2>
      </div>

      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          Register for available shifts below. You can only register, edit, or
          cancel registrations for Draft shifts. Once a shift is Published or
          Locked, no changes are allowed.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <ScheduleTable
            scheduleInWeek={scheduleGroups}
            rosterByEmployee={rosterByEmployee || []}
            weekDays={weekDays}
          />
        </div>
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-foreground">Pending</span>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {slots.filter((s) => s.assignments[0].status === ROSTER_STATUS.PENDING).length}
          </span>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-foreground">Approved</span>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {slots.filter((s) => s.assignments[0].status === ROSTER_STATUS.SCHEDULED).length}
          </span>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-foreground">Total Registered</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{slots.filter((s) => s.assignments[0]).length}</span>
        </div>
      </div> */}
    </div>
  );
}
