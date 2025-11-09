"use client";

import { BranchCalendarTable } from "./branch-calendar-table";
import { useGetBranchesWithShifts } from "@/hooks/useBranches/useBranchQueries";
import { useGetEmployees } from "@/hooks/useEmployees";
import { useGetSchedulesByBranch } from "@/hooks/useSchedules/useScheduleQueries";
import { generateWeekdays } from "@/utils/dateTimeHelpers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Calendar, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function CalendarsPage() {
  const [selectedBranchId, setSelectedBranchId] = useState(0);
  const weekDays = generateWeekdays(new Date("2025-10-13"));
  const [isLoading, setIsLoading] = useState(true);

  const { data: branches, isLoading: isFetchingBranches } =
    useGetBranchesWithShifts(selectedBranchId);

  // need to fetch employees by current role to get only employees in the selected branch
  const { data: employeesByCurrentRole, isLoading: isFetchingEmployees } =
    useGetEmployees();

  const { data: schedulesByBranch, isLoading: isFetchingSchedules } =
    useGetSchedulesByBranch(selectedBranchId);

  useEffect(() => {
    if (!branches || branches.length === 0) return;
    // only set default if no branch selected yet (selectedBranchId is falsy)
    setSelectedBranchId((prev) => (prev ? prev : branches[0].id));
  }, [branches]);

  useEffect(() => {
    setIsLoading(isFetchingBranches || isFetchingEmployees);
  }, [isFetchingBranches, isFetchingEmployees]);

  // no branches available
  if (!branches || branches.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          No Branches Available
        </h3>
        <p className="text-muted-foreground">
          You don&apos;t have any branches assigned to you.
        </p>
      </div>
    );
  }

  return isLoading ? (
    <div>Loading...</div>
  ) : (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Shift Calendar</h2>
      </div>

      {/* Branch Selector */}
      <Tabs
        value={selectedBranchId.toString()}
        onValueChange={(value) => setSelectedBranchId(+value)}
        className="w-full"
      >
        <TabsList
          className="grid w-full gap-2"
          style={{
            gridTemplateColumns: `repeat(${Math.min(branches.length, 3)}, 1fr)`,
          }}
        >
          {branches.map((branch) => (
            <TabsTrigger
              key={branch.id}
              value={branch.id.toString()}
              className="text-sm"
            >
              {branch.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* calendar by branch */}
        {branches.map((branch) => (
          <TabsContent
            key={branch.id}
            value={branch.id.toString()}
            className="space-y-6"
          >
            {!isFetchingSchedules &&
            schedulesByBranch &&
            employeesByCurrentRole ? (
              <BranchCalendarTable
                branch={branch}
                schedules={schedulesByBranch}
                employees={employeesByCurrentRole}
                weekDays={weekDays}
              />
            ) : (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
