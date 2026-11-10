// src/features/creative-assets/lib/batches.test.ts
import { keepLikedOnly, likedTexts, newBatch, nextBatchLabel, toggleItem } from "./batches";
import type { CreativeAssetsResult } from "../types";

const FORM = { taskType: "Hashtags", userQuery: "Bamboo", context: "", referenceExamples: "", numberOfSuggestions: 2 };

function sample(): CreativeAssetsResult {
  return {
    form: FORM,
    rounds: 1,
    batches: [
      newBatch("Batch 1", [{ suggestion: "#A", explanation: "" }, { suggestion: "#B", explanation: "" }], false),
    ],
  };
}

describe("newBatch", () => {
  it("creates items with their own ids and the given tick state", () => {
    const batch = newBatch("Batch 2", [{ suggestion: "#C", explanation: "" }], true);
    expect(batch.items).toEqual([{ id: expect.any(String), suggestion: "#C", explanation: "", liked: true }]);
    expect(batch.items[0].id).not.toBe(batch.id);
  });
});

describe("toggleItem", () => {
  it("flips only the ticked item and leaves the original result unchanged", () => {
    const result = sample();
    const itemId = result.batches[0].items[0].id;
    const next = toggleItem(result, itemId);
    expect(next.batches[0].items.map((item) => item.liked)).toEqual([true, false]);
    expect(result.batches[0].items[0].liked).toBe(false);
  });
});

describe("keepLikedOnly", () => {
  it("removes unticked items and drops batches that become empty", () => {
    const first = sample();
    const ticked = toggleItem(first, first.batches[0].items[0].id);
    const withEmpty: CreativeAssetsResult = {
      ...ticked,
      batches: [...ticked.batches, newBatch("Batch 2", [{ suggestion: "#Z", explanation: "" }], false)],
    };
    const kept = keepLikedOnly(withEmpty);
    expect(kept.batches).toHaveLength(1);
    expect(kept.batches[0].items.map((item) => item.suggestion)).toEqual(["#A"]);
    expect(kept.rounds).toBe(1);
  });
});

describe("likedTexts", () => {
  it("collects ticked texts from every batch once", () => {
    const result = sample();
    const first = result.batches[0].items[0].id;
    const second = result.batches[0].items[1].id;
    const ticked = toggleItem(toggleItem(result, first), second);
    const withRepeat: CreativeAssetsResult = {
      ...ticked,
      batches: [...ticked.batches, newBatch("Batch 2", [{ suggestion: "#A", explanation: "" }], true)],
    };
    expect(likedTexts(withRepeat)).toEqual(["#A", "#B"]);
  });
});

describe("nextBatchLabel", () => {
  it("names the round and says how many items it came from", () => {
    expect(nextBatchLabel(2, 3)).toBe("Batch 2 · from 3 liked");
  });
});
