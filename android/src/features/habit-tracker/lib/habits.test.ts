import {
  completionRate,
  currentStreak,
  isDone,
  lastDays,
  normalizeHabitData,
  removeHabit,
  toggleCompletion,
} from "./habits";

describe("habit completions", () => {
  it("ticks and unticks a day", () => {
    const ticked = toggleCompletion({}, "2026-11-09", "h1");
    expect(isDone(ticked, "2026-11-09", "h1")).toBe(true);
    const unticked = toggleCompletion(ticked, "2026-11-09", "h1");
    expect(unticked).toEqual({});
  });

  it("counts a streak ending today", () => {
    const completions = {
      "2026-11-07": ["h1"],
      "2026-11-08": ["h1"],
      "2026-11-09": ["h1"],
    };
    expect(currentStreak(completions, "h1", "2026-11-09")).toBe(3);
  });

  it("keeps the streak alive when today is not ticked yet", () => {
    const completions = { "2026-11-07": ["h1"], "2026-11-08": ["h1"] };
    expect(currentStreak(completions, "h1", "2026-11-09")).toBe(2);
  });

  it("computes the completion rate over a window", () => {
    const completions = { "2026-11-08": ["h1"], "2026-11-09": ["h1"] };
    expect(completionRate(completions, "h1", "2026-11-09", 4)).toBe(50);
  });

  it("returns day keys oldest first", () => {
    expect(lastDays("2026-11-09", 3)).toEqual(["2026-11-07", "2026-11-08", "2026-11-09"]);
  });
});

describe("habit data", () => {
  it("drops invalid habits and days", () => {
    const data = normalizeHabitData({
      habits: [{ id: "h1", name: " Read " }, { id: 2, name: "bad" }, null],
      completions: { "2026-11-09": ["h1", 5], "nope": ["h1"] },
    });
    expect(data.habits).toEqual([{ id: "h1", name: "Read", createdAt: new Date(0).toISOString() }]);
    expect(data.completions).toEqual({ "2026-11-09": ["h1"] });
  });

  it("removes a habit and its completions", () => {
    const data = removeHabit(
      {
        habits: [
          { id: "h1", name: "A", createdAt: "" },
          { id: "h2", name: "B", createdAt: "" },
        ],
        completions: { "2026-11-09": ["h1", "h2"], "2026-11-08": ["h1"] },
      },
      "h1",
    );
    expect(data.habits.map((h) => h.id)).toEqual(["h2"]);
    expect(data.completions).toEqual({ "2026-11-09": ["h2"] });
  });
});
