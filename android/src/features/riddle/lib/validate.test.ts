import { requireOption, requireText } from "./validate";

describe("requireText", () => {
  it("trims and returns the value", () => {
    expect(requireText("  Space  ", "Topic", 200)).toBe("Space");
  });

  it("rejects blank and over-long input", () => {
    expect(() => requireText("   ", "Topic", 200)).toThrow("Topic is required.");
    expect(() => requireText("x".repeat(201), "Topic", 200)).toThrow("Topic must be 200 characters or fewer.");
  });
});

describe("requireOption", () => {
  const domains = ["verbal", "lateral"] as const;

  it("returns a listed option", () => {
    expect(requireOption("lateral", domains, "Cognitive domain")).toBe("lateral");
  });

  it("rejects anything outside the list", () => {
    expect(() => requireOption("musical", domains, "Cognitive domain")).toThrow(
      "Cognitive domain must be one of: verbal, lateral.",
    );
  });
});
