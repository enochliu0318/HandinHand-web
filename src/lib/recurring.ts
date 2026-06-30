import { addDays, addWeeks, isAfter, setHours, setMinutes, startOfDay } from "date-fns";

export function applyTimeToDate(date: Date, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return setMinutes(setHours(startOfDay(date), hours), minutes);
}

export function getRecurringDates(
  dayOfWeek: number,
  startDate: Date,
  weeksAhead = 8,
  endDate?: Date | null
): Date[] {
  const dates: Date[] = [];
  let current = startOfDay(startDate);

  while (current.getDay() !== dayOfWeek) {
    current = addDays(current, 1);
  }

  const limit = endDate ?? addWeeks(startDate, weeksAhead);

  while (dates.length < weeksAhead && !isAfter(current, limit)) {
    dates.push(new Date(current));
    current = addDays(current, 7);
  }

  return dates;
}

export function combineDateAndTime(dateStr: string, timeStr: string): Date {
  return applyTimeToDate(new Date(dateStr), timeStr);
}
