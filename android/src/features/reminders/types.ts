// src/features/reminders/types.ts

export type ReminderUnit = "minutes" | "hours" | "days";

export interface Reminder {
  id: string;
  name: string;
  /** Repeat every N units. */
  every: number;
  unit: ReminderUnit;
  /** Active window as HH:mm. The window may cross midnight, e.g. 22:00 to 06:00. Equal times mean all day. */
  windowStart: string;
  windowEnd: string;
  /** Allowed weekdays, 0 = Sunday to 6 = Saturday. */
  weekdays: number[];
  enabled: boolean;
  createdAt: string;
}
