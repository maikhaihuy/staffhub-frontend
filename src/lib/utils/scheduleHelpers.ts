export const getScheduleKey = (shiftId: number, date: Date) => `${shiftId}-${date.toISOString()}`
