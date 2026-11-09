import { describeDateTime, formatDateTime, parseDateTime, requireText } from "./validate";
import { toWhatToDoNowResult } from "./normalise";

describe("what-to-do-now validate", () => {
  it("parses a valid date and time", () => {
    const date = parseDateTime("2026-11-09 14:30");
    expect(formatDateTime(date)).toBe("2026-11-09 14:30");
  });

  it("describes the weekday", () => {
    expect(describeDateTime("2026-11-09 14:30")).toBe("2026-11-09 14:30 (Monday)");
  });

  it("rejects malformed and impossible dates", () => {
    expect(() => parseDateTime("09/11/2026 14:30")).toThrow();
    expect(() => parseDateTime("2026-02-31 10:00")).toThrow();
    expect(() => parseDateTime("2026-11-09 25:00")).toThrow();
  });

  it("requires non-empty text within the limit", () => {
    expect(() => requireText("   ", "Goals", 10)).toThrow("Goals is required.");
    expect(() => requireText("abcdefghijk", "Goals", 10)).toThrow();
  });
});

describe("what-to-do-now normalise", () => {
  it("fills missing fields safely", () => {
    const result = toWhatToDoNowResult({ doNow: [{ action: "Write intro", minutes: 25.4 }, { action: "" }, null] });
    expect(result.timeContext).toBe("");
    expect(result.doNow).toEqual([{ action: "Write intro", goal: "", reason: "", minutes: 25 }]);
    expect(result.avoid).toEqual([]);
  });
});
