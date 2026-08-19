
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

// UTC, not local time: these represent a timezone-free "wall clock" time
// (matches the backend's `@db.Time` fields), and using local time here is a
// landmine - the placeholder 1970-01-01 date hits pre-1975 historical
// offsets in some IANA zones (e.g. Asia/Ho_Chi_Minh was UTC+8, not +7),
// which silently disagrees with the browser's *current* local offset.
export const getTime = (date: Date) => {
  const hh = date.getUTCHours().toString().padStart(2, '0')
  const mm = date.getUTCMinutes().toString().padStart(2, '0')
  return `${hh}:${mm}`
}

export const getTimeFromString = (time: string) => new Date(`1970-01-01T${time}:00.000Z`);

// Local calendar-day components, not `.toISOString().slice(0, 10)` - that
// converts through UTC first, which silently shifts the date near midnight
// whenever the local offset is positive (e.g. a UTC+7 local midnight is the
// previous day in UTC).
export const toDateOnlyString = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
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