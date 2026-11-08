// src/features/roadmap/lib/roadmap-ops.test.ts
import {
  addMainPoint,
  addSubtopic,
  applyExpansion,
  buildExpansionRequest,
  createRoadmap,
  removeMainPoint,
  removeSubtopic,
  renameMainPoint,
  renameSubtopic,
  sortByUpdated,
  toggleMainPoint,
  toggleSubtopic,
} from "./roadmap-ops";
import type { OpContext, Roadmap } from "../types";

function ctxFactory(now = "2026-01-02T00:00:00.000Z"): OpContext {
  let counter = 0;
  return { now, newId: () => `id-${++counter}` };
}

const form = {
  subject: "  Rust  ",
  startLevel: "Beginner",
  targetLevel: "Advanced",
  mode: "short" as const,
  personaStyle: "academic",
  userInstructions: "",
};

function baseRoadmap(): Roadmap {
  return {
    id: "r1",
    subject: "Rust",
    startLevel: "Beginner",
    targetLevel: "Advanced",
    mode: "detailed",
    personaStyle: "academic",
    userInstructions: "",
    persona: "You are a Rust mentor.",
    mainPoints: [
      {
        id: "p1",
        title: "Ownership",
        done: false,
        milestone: "Write a borrow checker quiz",
        subtopics: [{ id: "s1", title: "Moves", done: false }],
      },
      { id: "p2", title: "Traits", done: false, milestone: "", subtopics: [] },
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("createRoadmap", () => {
  it("builds a roadmap with trimmed subject and fresh ids", () => {
    const roadmap = createRoadmap({ form, persona: "Mentor", topics: [" Basics ", "", "Lifetimes"] }, ctxFactory());
    expect(roadmap.id).toBe("id-1");
    expect(roadmap.subject).toBe("Rust");
    expect(roadmap.mode).toBe("short");
    expect(roadmap.mainPoints.map((point) => point.title)).toEqual(["Basics", "Lifetimes"]);
    expect(roadmap.mainPoints[0]).toEqual({ id: "id-2", title: "Basics", done: false, milestone: "", subtopics: [] });
    expect(roadmap.createdAt).toBe(roadmap.updatedAt);
  });

  it("requires a subject", () => {
    expect(() => createRoadmap({ form: { ...form, subject: " " }, persona: "", topics: [] }, ctxFactory())).toThrow(
      "Subject is required.",
    );
  });
});

describe("main point edits", () => {
  it("toggles done and stamps updatedAt", () => {
    const next = toggleMainPoint(baseRoadmap(), "p1", ctxFactory());
    expect(next.mainPoints[0].done).toBe(true);
    expect(next.updatedAt).toBe("2026-01-02T00:00:00.000Z");
  });

  it("does not mutate the input roadmap", () => {
    const original = baseRoadmap();
    toggleMainPoint(original, "p1", ctxFactory());
    expect(original.mainPoints[0].done).toBe(false);
  });

  it("renames with trimmed text and ignores blank titles", () => {
    const renamed = renameMainPoint(baseRoadmap(), "p2", "  Generics  ", ctxFactory());
    expect(renamed.mainPoints[1].title).toBe("Generics");

    const base = baseRoadmap();
    expect(renameMainPoint(base, "p2", "   ", ctxFactory())).toBe(base);
  });

  it("adds, and removes by id", () => {
    const added = addMainPoint(baseRoadmap(), "Async", ctxFactory());
    expect(added.mainPoints.map((point) => point.title)).toEqual(["Ownership", "Traits", "Async"]);

    const removed = removeMainPoint(baseRoadmap(), "p1", ctxFactory());
    expect(removed.mainPoints.map((point) => point.id)).toEqual(["p2"]);
  });

  it("leaves the roadmap unchanged for an unknown point", () => {
    const base = baseRoadmap();
    expect(toggleMainPoint(base, "missing", ctxFactory())).toBe(base);
    expect(removeMainPoint(base, "missing", ctxFactory())).toBe(base);
  });
});

describe("subpoint edits", () => {
  it("adds, toggles, renames, and removes subpoints", () => {
    const ctx = ctxFactory();
    let roadmap = addSubtopic(baseRoadmap(), "p2", "Trait objects", ctx);
    expect(roadmap.mainPoints[1].subtopics).toEqual([{ id: "id-1", title: "Trait objects", done: false }]);

    roadmap = toggleSubtopic(roadmap, "p1", "s1", ctx);
    expect(roadmap.mainPoints[0].subtopics[0].done).toBe(true);

    roadmap = renameSubtopic(roadmap, "p1", "s1", "Moves and copies", ctx);
    expect(roadmap.mainPoints[0].subtopics[0].title).toBe("Moves and copies");

    roadmap = removeSubtopic(roadmap, "p1", "s1", ctx);
    expect(roadmap.mainPoints[0].subtopics).toEqual([]);
  });
});

describe("AI expansion", () => {
  it("builds the request from the roadmap context", () => {
    expect(buildExpansionRequest(baseRoadmap(), "p1")).toEqual({
      persona: "You are a Rust mentor.",
      subject: "Rust",
      targetLevel: "Advanced",
      fullTopicList: ["Ownership", "Traits"],
      currentModule: "Ownership",
      mode: "detailed",
    });
    expect(buildExpansionRequest(baseRoadmap(), "missing")).toBeNull();
  });

  it("replaces subpoints and keeps the old milestone when none comes back", () => {
    const next = applyExpansion(baseRoadmap(), "p1", { subtopics: ["Borrowing", "Lifetimes"], milestone: "" }, ctxFactory());
    expect(next.mainPoints[0].subtopics).toEqual([
      { id: "id-1", title: "Borrowing", done: false },
      { id: "id-2", title: "Lifetimes", done: false },
    ]);
    expect(next.mainPoints[0].milestone).toBe("Write a borrow checker quiz");
  });

  it("uses a new milestone when one is returned", () => {
    const next = applyExpansion(baseRoadmap(), "p2", { subtopics: [], milestone: "Build a trait" }, ctxFactory());
    expect(next.mainPoints[1].milestone).toBe("Build a trait");
  });
});

describe("sortByUpdated", () => {
  it("lists the most recently updated roadmap first without changing the input", () => {
    const older = { ...baseRoadmap(), id: "a", updatedAt: "2026-01-01T00:00:00.000Z" };
    const newer = { ...baseRoadmap(), id: "b", updatedAt: "2026-02-01T00:00:00.000Z" };
    const input = [older, newer];
    expect(sortByUpdated(input).map((item) => item.id)).toEqual(["b", "a"]);
    expect(input.map((item) => item.id)).toEqual(["a", "b"]);
  });
});
