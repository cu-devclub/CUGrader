import { CalendarDate, CalendarDateTime, getLocalTimeZone } from "@internationalized/date";
import { DateFormatter } from '@internationalized/date';

// const rtf = new Intl.RelativeTimeFormat("tf")

// TODO: locale, 
const df = new DateFormatter("th", {
  dateStyle: "medium",
  timeStyle: "short"
});

export function formatDateTime(datetime: CalendarDateTime) {
  // todo: fix hydration mistmatch, next-intl provide getTimezone or smth
  return df.format(datetime.toDate(getLocalTimeZone()));
}