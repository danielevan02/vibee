import { format, formatDistanceToNowStrict } from "date-fns";

/**
 * Date formatting shared by every timestamp in the app.
 *
 * The same guarded `formatDistanceToNowStrict` was written out four times -
 * post card, comment card, notification row, explore grid - each with its own
 * variable name and its own fallback. One copy means one behaviour, and one
 * place to change how the app talks about time.
 *
 * The guard is not decorative: dates arrive from JSON as strings, and an
 * unparseable one would otherwise throw during render.
 */

/** "3 hours ago". Falls back to a short absolute date if the value is unusable. */
export function relativeTime(value: Date | string): string {
  const date = new Date(value);
  try {
    return formatDistanceToNowStrict(date, { addSuffix: true });
  } catch {
    return shortDate(value);
  }
}

/** "Mar 04". */
export function shortDate(value: Date | string): string {
  try {
    return format(new Date(value), "MMM dd");
  } catch {
    return "";
  }
}

/** "Mar 04, 2026". */
export function fullDate(value: Date | string): string {
  try {
    return format(new Date(value), "MMM dd, yyyy");
  } catch {
    return "";
  }
}

/** "09:41 PM". */
export function clockTime(value: Date | string): string {
  try {
    return format(new Date(value), "hh:mm aa");
  } catch {
    return "";
  }
}

/** "March 2026", for "Joined ...". */
export function monthAndYear(value: Date | string): string {
  try {
    return format(new Date(value), "MMMM yyyy");
  } catch {
    return "Recently";
  }
}
