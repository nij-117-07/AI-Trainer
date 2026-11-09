// src/features/tasks/lib/reminders.test.ts
import { formatReminderDate, formatReminderInput, parseReminderInput, presetReminderInput } from "./reminders";

const now = new Date(2026, 10, 9, 8, 0);

describe("formatReminderDate", () => {
  it("formats local date and time", () => {
    expect(formatReminderDate(new Date(2026, 10, 9, 7, 5))).toBe("2026-11-09 07:05");
  });

  it("returns an empty string for a missing reminder", () => {
    expect(formatReminderInput(null)).toBe("");
  });
});

describe("parseReminderInput", () => {
  it("treats blank text as no reminder", () => {
    expect(parseReminderInput("  ", now)).toEqual({ ok: true, iso: null });
  });

  it("parses a future time in local time", () => {
    expect(parseReminderInput("2026-11-10 09:00", now)).toEqual({
      ok: true,
      iso: new Date(2026, 10, 10, 9, 0).toISOString(),
    });
  });

  it("rejects the wrong format", () => {
    expect(parseReminderInput("tomorrow", now).ok).toBe(false);
  });

  it("rejects dates that do not exist", () => {
    expect(parseReminderInput("2026-02-30 10:00", now)).toEqual({
      ok: false,
      error: "That date or time does not exist.",
    });
  });

  it("rejects past times unless allowed", () => {
    expect(parseReminderInput("2026-11-01 10:00", now).ok).toBe(false);
    expect(parseReminderInput("2026-11-01 10:00", now, { allowPast: true }).ok).toBe(true);
  });
});

describe("presetReminderInput", () => {
  it("offers one hour from now and 9:00 tomorrow", () => {
    expect(presetReminderInput("hour", now)).toBe("2026-11-09 09:00");
    expect(presetReminderInput("tomorrow", now)).toBe("2026-11-10 09:00");
  });
});
