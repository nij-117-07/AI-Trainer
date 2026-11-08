// src/features/ingredients/lib/validate.test.ts
import { optionalText, requireImage } from "./validate";

describe("optionalText", () => {
  it("returns undefined for blank input", () => {
    expect(optionalText("   ", "Manual text", 2000)).toBeUndefined();
  });

  it("trims and returns the text", () => {
    expect(optionalText("  water, sugar  ", "Manual text", 2000)).toBe("water, sugar");
  });

  it("rejects text longer than the limit", () => {
    expect(() => optionalText("x".repeat(2001), "Manual text", 2000)).toThrow(
      "Manual text must be 2000 characters or fewer.",
    );
  });
});

describe("requireImage", () => {
  it("returns the image when one is attached", () => {
    const image = { uri: "file:///photo.jpg", mimeType: "image/jpeg", base64: "abc" };
    expect(requireImage(image)).toBe(image);
  });

  it("asks for a photo when none is attached", () => {
    expect(() => requireImage(null)).toThrow("Choose an ingredients photo to analyze.");
  });
});
