export const queryKeys = {
  employees: {
    all: () => ["employees"],
    list: (filter?: { page?: number, pageSize?: number }) => ["employees", "list", filter],
    byBranch: (branchId: number) => ["employees", "byBranch", branchId],
    withAccount: (branchId?: number) => ["employees", "withAccount", branchId ? { branchId } : {}],
    detail: (employeeId: number) => ["employees", "detail", employeeId],
  },
  branches: {
    all: () => ["branches"],
    list: (filter?: { page?: number, pageSize?: number, all?: boolean }) => ["branches", "list", filter],
    detail: (branchId: number) => ["branches", "detail", branchId],
    withSchedules: (employeeId: number) => ["branches", "withSchedules", employeeId],
    withShifts: (employeeId: number) => ["branches", "withShifts", employeeId],
  },
  rosters: {
    byEmployee: (employeeId: number) => ["rosters", "byEmployee", employeeId],
  },
  schedules: {
    withRosters: (branchId?: number) => ["schedules", "withRosters", branchId ? { branchId } : {}],
  },
  shifts: {
    byBranch: (branchId: number) => ["shifts", "byBranch", branchId],
    detail: (shiftId: number) => ["shifts", "detail", shiftId],
  }
}
