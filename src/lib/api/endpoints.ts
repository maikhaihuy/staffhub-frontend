export const API_ENDPOINTS = {
  // Auth
  // NOTE: REGISTER/CHANGE_PASSWORD/FORGOT_PASSWORD/RESET_PASSWORD don't exist
  // on the backend anymore (password-reset flows were dropped in favor of
  // Zalo auth) - the corresponding auth.service.ts methods are dead until
  // the backend adds them back or the frontend drops these flows.
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
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
    HOURLY_RATES: (id: number) => `/employees/${id}/hourly-rates`,
  },

  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: number) => `/users/${id}`,
  },

  // Roles
  ROLES: {
    BASE: '/roles',
    BY_ID: (id: number) => `/roles/${id}`,
  },

  // Master Shift Templates (recurring shift definitions per branch, e.g. "Morning Shift")
  MASTER_SHIFT_TEMPLATES: {
    BASE: '/master-shift-templates',
    BY_ID: (id: number) => `/master-shift-templates/${id}`,
  },

  // Master Shifts (a dated instance of a shift, optionally generated from a template)
  MASTER_SHIFTS: {
    BASE: '/master-shifts',
    BY_ID: (id: number) => `/master-shifts/${id}`,
    GENERATE: '/master-shifts/generate',
  },

  // Sub Shifts (a role/slot within a MasterShift, e.g. "Cashier") - the
  // frontend currently auto-creates one default sub-shift per MasterShift.
  SUB_SHIFTS: {
    BASE: '/sub-shifts',
    BY_ID: (id: number) => `/sub-shifts/${id}`,
  },

  // Assignments (an employee assigned to a SubShift)
  ASSIGNMENTS: {
    BASE: '/assignments',
    BY_ID: (id: number) => `/assignments/${id}`,
    CHECK_IN: (id: number) => `/assignments/${id}/check-in`,
    CHECK_OUT: (id: number) => `/assignments/${id}/check-out`,
  },
} as const;