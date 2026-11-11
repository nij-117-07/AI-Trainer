// src/features/topic-suggestions/lib/topics.test.ts
import type { TopicRecommendation } from "@/features/guides/types";
import type { SavedTopic, TopicContext } from "../types";
import {
  appendTopics,
  describeAppend,
  listHistory,
  normalizeDraft,
  normalizeList,
  pickTopics,
  removeTopic,
  toggleTopic,
} from "./topics";

function ctxFactory(): TopicContext {
  let counter = 0;
  return { now: "2026-01-02T00:00:00.000Z", newId: () => `id-${++counter}` };
}

function suggestion(topicName: string): TopicRecommendation {
  return { topicName, reason: `${topicName} builds on your basics.` };
}

function savedTopic(id: string, topicName: string, done = false): SavedTopic {
  return { ...suggestion(topicName), id, done, addedAt: "2026-01-01T00:00:00.000Z" };
}

describe("appendTopics", () => {
  it("adds new topics to the end, unticked, with ids and timestamps", () => {
    const result = appendTopics([savedTopic("a", "Routing")], [suggestion("SQL injection")], ctxFactory());
    expect(result.added).toBe(1);
    expect(result.topics.map((topic) => topic.topicName)).toEqual(["Routing", "SQL injection"]);
    expect(result.topics[1]).toMatchObject({ id: "id-1", done: false, addedAt: "2026-01-02T00:00:00.000Z" });
  });

  it("skips names already on the list, ignoring case and spaces", () => {
    const result = appendTopics([savedTopic("a", "Routing")], [suggestion("  routing "), suggestion("XSS")], ctxFactory());
    expect(result.added).toBe(1);
    expect(result.skipped).toBe(1);
  });

  it("skips a repeat inside the same batch", () => {
    const result = appendTopics([], [suggestion("XSS"), suggestion("XSS")], ctxFactory());
    expect(result.added).toBe(1);
    expect(result.skipped).toBe(1);
  });
});

describe("pickTopics", () => {
  it("keeps only the ticked suggestions, in order", () => {
    const candidates = [suggestion("A"), suggestion("B"), suggestion("C")];
    expect(pickTopics(candidates, [true, false, true]).map((item) => item.topicName)).toEqual(["A", "C"]);
    expect(pickTopics(candidates, [false, false, false])).toEqual([]);
  });
});

describe("list changes", () => {
  it("toggles one topic and removes one topic by id", () => {
    const list = [savedTopic("a", "Routing"), savedTopic("b", "XSS")];
    expect(toggleTopic(list, "b")[1].done).toBe(true);
    expect(toggleTopic(list, "b")[0].done).toBe(false);
    expect(removeTopic(list, "a").map((topic) => topic.id)).toEqual(["b"]);
  });
});

describe("listHistory", () => {
  it("lists every name, one per line", () => {
    expect(listHistory([savedTopic("a", "Routing"), savedTopic("b", "XSS")])).toBe("Routing\nXSS");
  });

  it("drops the oldest names to stay under the limit", () => {
    const list = [savedTopic("a", "x".repeat(30)), savedTopic("b", "XSS")];
    expect(listHistory(list, 20)).toBe("XSS");
  });
});

describe("normalizeList", () => {
  it("keeps valid items and drops the rest", () => {
    const topics = normalizeList([
      { id: "a", topicName: "Routing", reason: "Basics", done: true },
      { topicName: "No id" },
      "junk",
    ]);
    expect(topics).toEqual([
      { id: "a", topicName: "Routing", reason: "Basics", done: true, addedAt: "" },
    ]);
  });

  it("returns an empty list for damaged data", () => {
    expect(normalizeList({ not: "a list" })).toEqual([]);
  });
});

describe("normalizeDraft", () => {
  it("uses defaults for missing or invalid fields", () => {
    const { form, batch } = normalizeDraft({ form: { broaderTopic: "Security", topicLevel: "Wizard" } });
    expect(form.broaderTopic).toBe("Security");
    expect(form.specificInterest).toBe("");
    expect(form.topicLevel).toBe("Intermediate");
    expect(batch).toBeNull();
  });

  it("restores a pending batch and drops it when it is empty", () => {
    expect(normalizeDraft({ batch: [{ topicName: "XSS", reason: "" }] }).batch).toEqual([
      { topicName: "XSS", reason: "", kept: false },
    ]);
    expect(normalizeDraft({ batch: [] }).batch).toBeNull();
  });

  it("keeps a stored kept flag and defaults it to false", () => {
    const { batch } = normalizeDraft({
      batch: [
        { topicName: "XSS", reason: "", kept: true },
        { topicName: "CSRF", reason: "" },
      ],
    });
    expect(batch?.map((topic) => topic.kept)).toEqual([true, false]);
  });
});

describe("describeAppend", () => {
  it("reports what was added and what was already there", () => {
    expect(describeAppend(2, 0)).toBe("Added 2 topics to your list.");
    expect(describeAppend(1, 1)).toBe("Added 1 topic to your list. 1 was already there.");
    expect(describeAppend(0, 2)).toBe("Those topics are already in your list.");
  });
});
