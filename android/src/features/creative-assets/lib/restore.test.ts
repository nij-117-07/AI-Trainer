// src/features/creative-assets/lib/restore.test.ts
import { restoreCreativeAssetsResult } from "./normalize";

describe("restoreCreativeAssetsResult", () => {
  it("keeps valid batches and items, and fills missing form fields with defaults", () => {
    const result = restoreCreativeAssetsResult({
      form: { taskType: "Slogans" },
      batches: [
        {
          id: "b1",
          label: "Batch 1",
          items: [
            { id: "i1", suggestion: "#A", explanation: "Short.", liked: true },
            { id: "i2", suggestion: "" },
          ],
        },
        { id: "b2", label: "Batch 2", items: [] },
      ],
    });
    expect(result?.form.taskType).toBe("Slogans");
    expect(result?.form.numberOfSuggestions).toBe(3);
    expect(result?.rounds).toBe(1);
    expect(result?.batches).toEqual([
      { id: "b1", label: "Batch 1", items: [{ id: "i1", suggestion: "#A", explanation: "Short.", liked: true }] },
    ]);
  });

  it("returns null when no batch is usable", () => {
    expect(restoreCreativeAssetsResult(null)).toBeNull();
    expect(restoreCreativeAssetsResult({ batches: [{ id: "b1", label: "x", items: [] }] })).toBeNull();
  });
});
