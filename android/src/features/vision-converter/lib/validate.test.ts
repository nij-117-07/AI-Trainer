// src/features/vision-converter/lib/validate.test.ts
import { DEFAULT_INSTRUCTION, INSTRUCTION_MAX, instructionOrDefault, requireImage } from "./validate";

describe("requireImage", () => {
  it("returns the image when one is chosen", () => {
    const image = { uri: "file:///a.jpg", mimeType: "image/jpeg", base64: "abc" };
    expect(requireImage(image)).toBe(image);
  });

  it("rejects a missing image", () => {
    expect(() => requireImage(null)).toThrow("Choose an image to convert first.");
  });
});

describe("instructionOrDefault", () => {
  it("trims the instruction", () => {
    expect(instructionOrDefault("  Extract tables.  ")).toBe("Extract tables.");
  });

  it("falls back to the webui default when blank", () => {
    expect(instructionOrDefault("   ")).toBe(DEFAULT_INSTRUCTION);
  });

  it("rejects an instruction longer than the limit", () => {
    expect(() => instructionOrDefault("x".repeat(INSTRUCTION_MAX + 1))).toThrow(
      `Instruction must be ${INSTRUCTION_MAX} characters or fewer.`,
    );
  });
});
