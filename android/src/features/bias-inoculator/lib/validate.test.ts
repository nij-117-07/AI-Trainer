// src/features/bias-inoculator/lib/validate.test.ts
import { requireText, resolveTargetBias } from "./validate";

describe("requireText", () => {
  it("trims and enforces the 200 character limit", () => {
    expect(requireText("  Trading ", "Field of interest", 200)).toBe("Trading");
    expect(() => requireText(" ", "Field of interest", 200)).toThrow("Field of interest is required.");
    expect(() => requireText("x".repeat(201), "Field of interest", 200)).toThrow(
      "Field of interest must be 200 characters or fewer.",
    );
  });
});

describe("resolveTargetBias", () => {
  it("keeps a named bias", () => {
    expect(resolveTargetBias("sunk_cost")).toBe("sunk_cost");
  });

  it("picks a bias for random using the supplied generator", () => {
    expect(resolveTargetBias("random", () => 0)).toBe("anchoring");
    expect(resolveTargetBias("random", () => 0.999)).toBe("framing");
  });

  it("rejects values outside the backend enum", () => {
    expect(() => resolveTargetBias("gambler")).toThrow("Target bias must be random or one of:");
  });
});
