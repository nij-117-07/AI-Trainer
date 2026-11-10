import type { Reminder } from "../types";
import { describeDays, describeNext, describeReminder } from "./labels";

const base: Reminder = {
  id: "r1",
  name: "Drink water",
  every: 2,
  unit: "hours",
  windowStart: "09:00",
  windowEnd: "21:00",
  weekdays: [0, 1, 2, 3, 4, 5, 6],
  enabled: true,
  createdAt: "",
};

describe("reminder labels", () => {
  it("summarises the days", () => {
    expect(describeDays([0, 1, 2, 3, 4, 5, 6])).toBe("Every day");
    expect(describeDays([1, 2, 3, 4, 5])).toBe("Mon–Fri");
    expect(describeDays([0, 6])).toBe("Sat, Sun");
  });

  it("describes the schedule in one line", () => {
    expect(describeReminder(base)).toBe("Every 2 hours · 09:00–21:00 · Every day");
    expect(describeReminder({ ...base, every: 1, unit: "days" })).toBe("Every 1 day · 09:00–21:00 · Every day");
  });

  it("says a paused reminder is paused", () => {
    expect(describeNext({ ...base, enabled: false }, new Date())).toBe("Paused");
  });
});
