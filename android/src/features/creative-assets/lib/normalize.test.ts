// src/features/creative-assets/lib/normalize.test.ts
import { normalizeCreativeAssets } from "./normalize";

describe("normalizeCreativeAssets", () => {
  it("reads each suggestion and drops entries without text", () => {
    const result = normalizeCreativeAssets({
      suggestions: [
        { suggestion: " #GreenRoutine ", explanation: "Matches the Gen Z tone." },
        { suggestion: "#ZeroWaste" },
        { suggestion: "  ", explanation: "No name" },
        "not an object",
      ],
    });
    expect(result).toEqual({
      suggestions: [
        { suggestion: "#GreenRoutine", explanation: "Matches the Gen Z tone." },
        { suggestion: "#ZeroWaste", explanation: "" },
      ],
    });
  });

  it("returns an empty list when suggestions are missing", () => {
    expect(normalizeCreativeAssets({})).toEqual({ suggestions: [] });
    expect(normalizeCreativeAssets({ suggestions: "none" })).toEqual({ suggestions: [] });
  });
});
