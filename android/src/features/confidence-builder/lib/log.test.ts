// src/features/confidence-builder/lib/log.test.ts
import type { ConfidenceTask } from "../types";
import { dropRound, EMPTY_LOG, finishRound, markDone, rateAfter, rateBefore, setReflection, startRound, summarise } from "./log";
import { toConfidenceLog } from "./normalise";

const task: ConfidenceTask = {
  title: "Ask one question",
  why: "Asking builds comfort.",
  steps: ["Write the question"],
  successSign: "You asked it.",
};

function completed(before: 1 | 2 | 3 | 4 | 5, after: 1 | 2 | 3 | 4 | 5) {
  let log = startRound(EMPTY_LOG, task, "ask", "2026-01-01T09:00:00.000Z");
  log = rateBefore(log, before);
  log = markDone(log, "2026-01-01T10:00:00.000Z");
  log = rateAfter(log, after);
  return finishRound(log, "id", "2026-01-01T10:05:00.000Z");
}

describe("a practice round", () => {
  it("moves from rating to done to saved, and adds one history entry", () => {
    const log = completed(2, 4);
    expect(log.active).toBeNull();
    expect(log.entries).toEqual([
      {
        id: "id",
        title: "Ask one question",
        focus: "ask",
        before: 2,
        after: 4,
        reflection: "",
        completedAt: "2026-01-01T10:05:00.000Z",
      },
    ]);
  });

  it("does not save a round that is missing a rating or the done step", () => {
    let log = startRound(EMPTY_LOG, task, "ask", "2026-01-01T09:00:00.000Z");
    log = rateBefore(log, 3);
    expect(finishRound(log, "id", "2026-01-01T10:00:00.000Z")).toBe(log);
    expect(markDone(EMPTY_LOG, "2026-01-01T10:00:00.000Z")).toEqual(EMPTY_LOG);
  });

  it("drops the active round without saving it", () => {
    const log = dropRound(setReflection(rateBefore(startRound(EMPTY_LOG, task, "ask", "2026-01-01T09:00:00.000Z"), 1), "x"));
    expect(log).toEqual(EMPTY_LOG);
  });

  it("trims the reflection when the round is saved", () => {
    let log = startRound(EMPTY_LOG, task, "ask", "2026-01-01T09:00:00.000Z");
    log = setReflection(rateBefore(log, 1), "  It went fine.  ");
    log = finishRound(rateAfter(markDone(log, "2026-01-01T10:00:00.000Z"), 3), "id", "2026-01-01T10:05:00.000Z");
    expect(log.entries[0].reflection).toBe("It went fine.");
  });
});

describe("summarise", () => {
  it("reports no average before any round is saved", () => {
    expect(summarise([])).toEqual({ count: 0, averageGain: null, daysPracticed: 0 });
  });

  it("averages the gain and counts distinct days", () => {
    const first = completed(2, 4).entries;
    const second = completed(3, 3).entries;
    const summary = summarise([...first, ...second, { ...first[0], id: "other", completedAt: "2026-01-02T08:00:00.000Z" }]);
    expect(summary).toEqual({ count: 3, averageGain: 1.3, daysPracticed: 2 });
  });
});

describe("toConfidenceLog", () => {
  it("keeps valid entries and drops broken ones", () => {
    const log = toConfidenceLog({
      entries: [
        { id: "a", title: "Ask", focus: "ask", before: 2, after: 4, completedAt: "2026-01-01T10:00:00.000Z" },
        { id: "b", title: "Share", focus: "share", before: 9, after: 4, completedAt: "2026-01-01T10:00:00.000Z" },
        { id: "c", title: "Speak", focus: "speak-up", before: 1, after: 1, completedAt: "not a date" },
      ],
      active: null,
    });
    expect(log.entries.map((entry) => entry.id)).toEqual(["a"]);
  });

  it("restores an active round and rejects a round with no task", () => {
    const saved = toConfidenceLog({
      active: { task: { title: "Ask" }, focus: "ask", before: 3, startedAt: "2026-01-01T09:00:00.000Z", doneAt: null },
    });
    expect(saved.active?.task.title).toBe("Ask");
    expect(saved.active?.before).toBe(3);
    expect(toConfidenceLog({ active: { task: {}, focus: "ask", startedAt: "2026-01-01T09:00:00.000Z" } }).active).toBeNull();
  });

  it("returns an empty log for damaged data", () => {
    expect(toConfidenceLog("junk")).toEqual(EMPTY_LOG);
  });
});
