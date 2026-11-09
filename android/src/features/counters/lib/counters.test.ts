import { adjustCount, normalizeCounterData, parseTarget, progressOf } from "./counters";
import { durationFromParts, formatClock, pauseTimer, remainingMs, idleTimer, startTimer, syncTimer } from "./timer";

describe("counter rules", () => {
  it("never goes below zero", () => {
    expect(adjustCount(0, -1)).toBe(0);
    expect(adjustCount(3, 1)).toBe(4);
  });

  it("caps progress at 100%", () => {
    expect(progressOf(4, 8)).toBe(0.5);
    expect(progressOf(12, 8)).toBe(1);
  });

  it("validates the target", () => {
    expect(parseTarget("8")).toBe(8);
    expect(parseTarget("0")).toBeNull();
    expect(parseTarget("2.5")).toBeNull();
    expect(parseTarget("")).toBeNull();
  });

  it("drops invalid stored counters", () => {
    const data = normalizeCounterData({
      counters: [
        { id: "c1", name: "Water", target: 8, count: 3, createdAt: "x" },
        { id: "c2", name: "", target: 8, count: 0 },
        { id: "c3", name: "Bad", target: 0, count: 0 },
      ],
    });
    expect(data.counters.map((c) => c.id)).toEqual(["c1"]);
  });
});

describe("countdown timer", () => {
  it("pauses and resumes without losing time", () => {
    let state = startTimer(idleTimer(10_000), 1_000);
    state = pauseTimer(state, 4_000);
    expect(state.status).toBe("paused");
    expect(remainingMs(state, 100_000)).toBe(7_000);
    state = startTimer(state, 50_000);
    expect(remainingMs(state, 52_000)).toBe(5_000);
  });

  it("finishes when the end time passes", () => {
    const state = syncTimer(startTimer(idleTimer(1_000), 0), 1_500);
    expect(state.status).toBe("done");
    expect(remainingMs(state, 1_500)).toBe(0);
  });

  it("formats time as HH:MM:SS", () => {
    expect(formatClock(2 * 3600 * 1000)).toBe("02:00:00");
    expect(formatClock(61_200)).toBe("00:01:02");
  });

  it("validates duration parts", () => {
    expect(durationFromParts("2", "", "")).toBe(7200);
    expect(durationFromParts("0", "0", "0")).toBeNull();
    expect(durationFromParts("0", "75", "0")).toBeNull();
    expect(durationFromParts("a", "0", "0")).toBeNull();
  });
});
