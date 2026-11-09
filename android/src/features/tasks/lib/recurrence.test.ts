// src/features/tasks/lib/recurrence.test.ts
import { nextDueDate, nextOccurrenceAfter, shiftReminder } from "./recurrence";

describe("nextDueDate", () => {
  it("adds one day, one week, one month, or one year", () => {
    expect(nextDueDate("2026-01-10", "daily")).toBe("2026-01-11");
    expect(nextDueDate("2026-01-10", "weekly")).toBe("2026-01-17");
    expect(nextDueDate("2026-01-10", "monthly")).toBe("2026-02-10");
    expect(nextDueDate("2026-01-10", "yearly")).toBe("2027-01-10");
  });

  it("clamps the day of month when the next month is shorter", () => {
    expect(nextDueDate("2026-01-31", "monthly")).toBe("2026-02-28");
  });

  it("clamps leap day for a yearly task", () => {
    expect(nextDueDate("2028-02-29", "yearly")).toBe("2029-02-28");
  });
});

describe("nextOccurrenceAfter", () => {
  it("skips occurrences that are still in the past", () => {
    expect(nextOccurrenceAfter("2026-01-08", "daily", "2026-01-10")).toBe("2026-01-11");
  });
});

describe("shiftReminder", () => {
  it("moves the reminder by the same days and keeps the time", () => {
    const reminder = new Date(2026, 0, 10, 8, 30).toISOString();
    expect(shiftReminder(reminder, "2026-01-10", "2026-01-13")).toBe(new Date(2026, 0, 13, 8, 30).toISOString());
  });
});
