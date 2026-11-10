// src/features/topic-of-the-day/lib/daily.ts

/** The local calendar date as YYYY-MM-DD, shown with the topic and sent to the model. */
export function dailyDate(now: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
