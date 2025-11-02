
export interface Weekday {
  dayName: string,
  date: Date,
}

export type TimeRange = { startTime: string; endTime: string }

export const generateWeekdays = (date: Date): Weekday[] => {
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // get first day (Sunday) of the week
  const start = new Date(date);
  const day = start.getDay(); // 0 = Sunday
  const diff = (day === 0 ? -6 : 1 - day); // if Sunday, go back 6 days; else go back to Monday
  start.setDate(start.getDate() + diff); // move to Sunday

  // build full week
  const week = daysOfWeek.map((dayName, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      dayName: dayName,
      date: d,
    };
  });

  return week;
}

export const getTime = (date: Date) => {
  const hh = date.getHours().toString().padStart(2, '0')
  const mm = date.getMinutes().toString().padStart(2, '0')
  return `${hh}:${mm}`
}

export const getTimeFromString = (time: string) => new Date(`1970-01-01T${time}`);
export const combineDateTime = (dateOnly: Date, timeOnly: Date) => {
  const date = new Date(dateOnly)
  const time = new Date(timeOnly)

  // Combine
  date.setHours(
    time.getHours(),
    time.getMinutes(),
    time.getSeconds(),
    time.getMilliseconds()
  )

  return date
}