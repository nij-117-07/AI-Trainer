// src/features/pareto-topics/lib/normalise.test.ts
import type { ParetoFormValues, ParetoTopic } from "../types";
import { toParetoList, toParetoResult } from "./normalise";
import { coverageOf } from "./coverage";

const defaults: ParetoFormValues = {
  field: "",
  goal: "Do the core work",
  level: "beginner",
  instructions: "",
};

describe("toParetoResult", () => {
  it("drops topics without a title and clamps work shares to 0 to 100", () => {
    const result = toParetoResult({
      topics: [
        { title: " SQL joins ", why: "Used daily.", keyIdeas: ["INNER JOIN", 3, ""], workShare: 140 },
        { why: "No title" },
        { title: "Filtering", workShare: "soon" },
      ],
      skipForNow: ["Stored procedures", ""],
      coachNote: "Start small.",
    });
    expect(result.topics).toEqual([
      { kept: false, title: "SQL joins", why: "Used daily.", keyIdeas: ["INNER JOIN"], workShare: 100 },
      { kept: false, title: "Filtering", why: "", keyIdeas: [], workShare: null },
    ]);
    expect(result.skipForNow).toEqual(["Stored procedures"]);
    expect(result.coachNote).toBe("Start small.");
  });
});

describe("toParetoList", () => {
  it("keeps custom goal and level text and falls back to defaults for corrupt fields", () => {
    const list = toParetoList(
      {
        id: "list-1",
        form: { goal: "Switch from accounting", level: "Principal analyst", field: 5 },
        result: { topics: [{ title: "Charts" }] },
        updatedAt: "2026-11-01T10:00:00.000Z",
      },
      defaults,
    );
    expect(list?.id).toBe("list-1");
    expect(list?.form).toEqual({ ...defaults, goal: "Switch from accounting", level: "Principal analyst" });
    expect(toParetoList({ id: "x", form: { goal: "  ", level: 3 } }, defaults)?.form).toEqual(defaults);
    expect(list?.result.topics.map((topic) => topic.title)).toEqual(["Charts"]);
    expect(list?.createdAt).toBe("2026-11-01T10:00:00.000Z");
  });

  it("drops an entry without an id", () => {
    expect(toParetoList({ form: defaults }, defaults)).toBeNull();
  });
});

describe("coverageOf", () => {
  const topic = (workShare: number | null): ParetoTopic => ({
    kept: false,
    title: "t",
    why: "",
    keyIdeas: [],
    workShare,
  });

  it("returns null when no topic has an estimate", () => {
    expect(coverageOf([topic(null)])).toBeNull();
  });

  it("adds the shares and caps the total at 100", () => {
    expect(coverageOf([topic(40), topic(null), topic(35)])).toBe(75);
    expect(coverageOf([topic(70), topic(60)])).toBe(100);
  });
});
