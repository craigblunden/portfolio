import { format, parseISO } from "date-fns";

/**
 * Formats a YYYY-MM-DD frontmatter date for display.
 *
 * parseISO treats a date-only string as local time, unlike `new Date(...)` which
 * treats it as UTC and can render the previous day in negative-offset timezones.
 */
export function formatPostDate(date: string): string {
  return format(parseISO(date), "d MMM yyyy").toLowerCase();
}
