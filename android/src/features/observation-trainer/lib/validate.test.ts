// src/features/observation-trainer/lib/validate.test.ts
import { optionalText, requireImage, requireText } from "./validate";

describe("requireText", () => {
  it("trims and returns the value", () => {
    expect(requireText("  Crime scene  ", "Training scenario", 500)).toBe("Crime scene");
  });

  it("rejects blank and over-long input", () => {
    expect(() => requireText("   ", "Training scenario", 500)).toThrow("Training scenario is required.");
    expect(() => requireText("x".repeat(501), "Training scenario", 500)).toThrow(
      "Training scenario must be 500 characters or fewer.",
    );
  });
});

describe("optionalText", () => {
  it("returns undefined for blank input", () => {
    expect(optionalText("  ", "Training focus", 200)).toBeUndefined();
  });

  it("rejects text longer than the limit", () => {
    expect(() => optionalText("x".repeat(201), "Training focus", 200)).toThrow();
  });
});

describe("requireImage", () => {
  it("returns the image when one is chosen", () => {
    const image = { uri: "file:///a.jpg", mimeType: "image/jpeg", base64: "AAAA" };
    expect(requireImage(image)).toBe(image);
  });

  it("asks for an image when none is chosen", () => {
    expect(() => requireImage(null)).toThrow("Choose an image to observe first.");
  });
});
