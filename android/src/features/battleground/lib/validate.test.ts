// src/features/battleground/lib/validate.test.ts
import { requireDifficulty, requireMove, requireText } from "./validate";

describe("requireText", () => {
  it("trims and rejects blank or over-long input", () => {
    expect(requireText("  Viper  ", "Callsign", 100)).toBe("Viper");
    expect(() => requireText("   ", "Battleground topic", 300)).toThrow("Battleground topic is required.");
    expect(() => requireText("x".repeat(301), "Battleground topic", 300)).toThrow(
      "Battleground topic must be 300 characters or fewer.",
    );
  });
});

describe("requireDifficulty", () => {
  it("accepts the three backend levels only", () => {
    expect(requireDifficulty("hard")).toBe("hard");
    expect(() => requireDifficulty("insane")).toThrow("Difficulty must be one of: easy, medium, hard.");
  });
});

describe("requireMove", () => {
  it("requires a non-empty response of at most 2000 characters", () => {
    expect(requireMove(" Isolate the host ")).toBe("Isolate the host");
    expect(() => requireMove("")).toThrow("Your move is required.");
    expect(() => requireMove("x".repeat(2001))).toThrow("Your move must be 2000 characters or fewer.");
  });
});
