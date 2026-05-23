export const API_ENDPOINTS = {
  //Base
  BASE: '/api',
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    CHANGE_PASSWORD: "/auth/change-password",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  
  // Branches
  BRANCHES: {
    BASE: '/branches',
    BY_ID: (id: number) => `/branches/${id}`,
    WITH_SHIFTS: (id: number) => `/branches/${id}/shifts`,
    WITH_SCHEDULES: (id: number) => `/branches/${id}/schedules`,
  },
  
  // Employees
  EMPLOYEES: {
    BASE: '/employees',
    BY_ID: (id: number) => `/employees/${id}`,
    BY_BRANCH: (branchId: number) => `/branches/${branchId}/employees`,
  },
  
  // Schedules
  SCHEDULES: {
    BASE: '/schedules',
    BY_ID: (id: number) => `/schedules/${id}`,
    BY_BRANCH: (branchId: number) => `/branches/${branchId}/schedules`,
    PUBLISH: (id: number) => `/schedules/${id}/publish`,
  },
  
  // Rosters
  ROSTERS: {
    BASE: '/rosters',
    BY_ID: (id: number) => `/rosters/${id}`,
    BY_EMPLOYEE: (employeeId: number) => `/employees/${employeeId}/rosters`,
    SCHEDULE: (id: number) => `/rosters/${id}/schedule`,
  },
} as const;