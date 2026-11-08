// src/features/word-of-the-day/lib/daily.test.ts
import { dailyDate, dailySeed } from "./daily";

describe("dailyDate", () => {
  it("formats the local calendar date as YYYY-MM-DD", () => {
    expect(dailyDate(new Date(2026, 0, 5, 12))).toBe("2026-01-05");
    expect(dailyDate(new Date(2026, 10, 8, 23))).toBe("2026-11-08");
  });
});

describe("dailySeed", () => {
  it("uses the day of the month, like the backend", () => {
    expect(dailySeed(new Date(2026, 10, 8))).toBe("fixed_seed_8");
  });
});
