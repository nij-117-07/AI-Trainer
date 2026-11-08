// src/features/word-of-the-day/lib/daily.ts
/**
 * Date and seed for the day's word, matching the backend: the local calendar date, and a seed that
 * changes with the day of the month.
 */

export function dailyDate(now: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function dailySeed(now: Date): string {
  return `fixed_seed_${now.getDate()}`;
}
