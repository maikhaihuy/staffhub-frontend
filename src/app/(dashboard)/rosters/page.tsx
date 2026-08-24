"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { WeeklyScheduleView } from "./weekly-schedule-view";
import { WeekNavigator } from "./week-navigator";
import { useGetBranches } from "@/features/branch/hooks/useBranchQueries";
import { generateWeekdays } from "@/lib/utils/dateTimeHelpers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2, Settings } from "lucide-react";
import { useEffect, useState } from "react";

export default function CalendarsPage() {
  const searchParams = useSearchParams();
  const [selectedBranchId, setSelectedBranchId] = useState(0);
  const [weekAnchor, setWeekAnchor] = useState(new Date());
  const weekDays = generateWeekdays(weekAnchor);

  const { data: branches, isLoading: isFetchingBranches } = useGetBranches();

  useEffect(() => {
    const branchIdParam = Number(searchParams.get("branchId"));
    if (branchIdParam) setSelectedBranchId(branchIdParam);
  }, [searchParams]);

  useEffect(() => {
    if (!branches || branches.length === 0) return;
    // only set default if no branch selected yet (selectedBranchId is falsy)
    setSelectedBranchId((prev) => (prev ? prev : branches[0].id));
  }, [branches]);

  const goToPreviousWeek = () =>
    setWeekAnchor((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 7);
      return next;
    });

  const goToNextWeek = () =>
    setWeekAnchor((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });

  const goToThisWeek = () => setWeekAnchor(new Date());

  // no branches available
  if (!isFetchingBranches && (!branches || branches.length === 0)) {
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

  return isFetchingBranches || !branches ? (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ) : (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-foreground">Weekly Schedule</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <WeekNavigator
            weekDays={weekDays}
            onPrevious={goToPreviousWeek}
            onNext={goToNextWeek}
            onThisWeek={goToThisWeek}
          />
          <Button variant="outline" className="gap-1" asChild>
            <Link
              href={selectedBranchId ? `/shifts?branchId=${selectedBranchId}` : "/shifts"}
            >
              <Settings className="h-4 w-4" />
              Manage Shift Templates
            </Link>
          </Button>
        </div>
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
            {selectedBranchId === branch.id && (
              <WeeklyScheduleView branchId={branch.id} weekDays={weekDays} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
