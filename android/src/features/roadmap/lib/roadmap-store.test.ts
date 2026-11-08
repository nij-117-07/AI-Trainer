// src/features/roadmap/lib/roadmap-store.test.ts
import { deleteRoadmap, getRoadmap, loadRoadmaps, ROADMAP_LIST_KEY, saveRoadmap } from "./roadmap-store";
import type { Roadmap } from "../types";

const mockStore = new Map<string, string>();

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: async (key: string) => mockStore.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      mockStore.set(key, value);
    },
    removeItem: async (key: string) => {
      mockStore.delete(key);
    },
  },
}));

function roadmap(id: string, updatedAt: string): Roadmap {
  return {
    id,
    subject: `Subject ${id}`,
    startLevel: "Beginner",
    targetLevel: "Expert",
    mode: "detailed",
    personaStyle: "",
    userInstructions: "",
    persona: "",
    mainPoints: [],
    createdAt: updatedAt,
    updatedAt,
  };
}

describe("roadmap store", () => {
  beforeEach(() => {
    mockStore.clear();
  });

  it("saves new roadmaps and replaces existing ones by id", async () => {
    await saveRoadmap(roadmap("a", "2026-01-01T00:00:00.000Z"));
    await saveRoadmap(roadmap("b", "2026-01-02T00:00:00.000Z"));
    await saveRoadmap({ ...roadmap("a", "2026-01-03T00:00:00.000Z"), subject: "Renamed" });

    const list = await loadRoadmaps();
    expect(list.map((item) => item.id)).toEqual(["a", "b"]);
    expect(list[0].subject).toBe("Renamed");
    expect(JSON.parse(mockStore.get(ROADMAP_LIST_KEY) ?? "[]")).toHaveLength(2);
  });

  it("runs overlapping writes in order without losing either", async () => {
    await Promise.all([
      saveRoadmap(roadmap("x", "2026-01-01T00:00:00.000Z")),
      saveRoadmap(roadmap("y", "2026-01-01T00:00:00.000Z")),
      saveRoadmap(roadmap("z", "2026-01-01T00:00:00.000Z")),
    ]);
    const ids = (await loadRoadmaps()).map((item) => item.id).sort();
    expect(ids).toEqual(["x", "y", "z"]);
  });

  it("deletes by id and finds roadmaps by id", async () => {
    await saveRoadmap(roadmap("a", "2026-01-01T00:00:00.000Z"));
    await saveRoadmap(roadmap("b", "2026-01-02T00:00:00.000Z"));
    await deleteRoadmap("a");

    expect(await getRoadmap("a")).toBeNull();
    expect((await getRoadmap("b"))?.subject).toBe("Subject b");
  });

  it("ignores corrupt stored data", async () => {
    mockStore.set(ROADMAP_LIST_KEY, "{not json");
    expect(await loadRoadmaps()).toEqual([]);
  });
});
