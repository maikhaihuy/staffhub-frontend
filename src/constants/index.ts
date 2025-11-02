export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE_SIZE_OPTIONS: [1, 2, 5, 10],
} as const;

export const SCHEDULE_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  LOCKED: "locked",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
} as const;

export const ROSTER_STATUS = {
  PENDING: "pending",
  SCHEDULED: "scheduled",
  REJECTED: "rejected",
  FINISHED: "finished",
  ABSENT: "absent",
} as const;

export const ROSTER_MODE = {
  REQUEST: 'request',
  ASSIGNED: 'assigned',
}
