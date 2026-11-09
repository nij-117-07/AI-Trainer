import type { Reminder } from "../types";
import { inWindow, occurrencesFor, parseClock } from "./schedule";

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

const hm = (date: Date) => `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

describe("reminder schedule", () => {
  it("parses clock times", () => {
    expect(parseClock("09:30")).toBe(570);
    expect(parseClock("24:00")).toBeNull();
    expect(parseClock("9am")).toBeNull();
  });

  it("handles windows that cross midnight", () => {
    expect(inWindow(23 * 60, 22 * 60, 6 * 60)).toBe(true);
    expect(inWindow(12 * 60, 22 * 60, 6 * 60)).toBe(false);
  });

  it("repeats every N hours inside the active window", () => {
    const from = new Date(2026, 10, 9, 8, 0);
    const horizon = new Date(2026, 10, 9, 22, 0);
    const times = occurrencesFor(base, from, horizon).map(hm);
    expect(times).toEqual(["09:00", "11:00", "13:00", "15:00", "17:00", "19:00"]);
  });

  it("only fires on allowed weekdays", () => {
    const weekdaysOnly = { ...base, unit: "days" as const, every: 1, windowStart: "08:00", windowEnd: "09:00", weekdays: [1] };
    const from = new Date(2026, 10, 9); // Monday
    const days = occurrencesFor(weekdaysOnly, from, new Date(2026, 10, 16)).map((d) => d.getDay());
    expect(days.every((day) => day === 1)).toBe(true);
    expect(days.length).toBeGreaterThan(0);
  });

  it("returns nothing when disabled", () => {
    const from = new Date(2026, 10, 9, 8, 0);
    expect(occurrencesFor({ ...base, enabled: false }, from, new Date(2026, 10, 10))).toEqual([]);
  });
});
