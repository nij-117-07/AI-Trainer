// src/features/debate/lib/validate.test.ts
import { buildPersonaInput, clampCount, parseInfluences, requireText } from "./validate";
import type { PersonaFormValues } from "../types";

const VALID: PersonaFormValues = {
  archetype: " Cynical Academic ",
  style: "data-driven",
  intensity: 7,
  influences: "Keynes,  Game Theory, ",
  topic: "Universal Basic Income",
  customConstraints: "",
};

describe("requireText", () => {
  it("rejects blank and over-long statements", () => {
    expect(requireText("  Keep it short. ", "Statement", 2000)).toBe("Keep it short.");
    expect(() => requireText(" ", "Statement", 2000)).toThrow("Statement is required.");
    expect(() => requireText("x".repeat(2001), "Statement", 2000)).toThrow(
      "Statement must be 2000 characters or fewer.",
    );
  });
});

describe("parseInfluences", () => {
  it("splits on commas and drops empty entries", () => {
    expect(parseInfluences("Keynes,  Game Theory, ")).toEqual(["Keynes", "Game Theory"]);
  });
});

describe("clampCount", () => {
  it("keeps intensity inside 1-10", () => {
    expect(clampCount(0, 1, 10)).toBe(1);
    expect(clampCount(14, 1, 10)).toBe(10);
    expect(clampCount(6.4, 1, 10)).toBe(6);
  });
});

describe("buildPersonaInput", () => {
  it("builds a trimmed, side-specific persona request", () => {
    const input = buildPersonaInput(VALID, "con");
    expect(input).toEqual({
      archetype: "Cynical Academic",
      style: "data-driven",
      intensity: 7,
      influences: ["Keynes", "Game Theory"],
      topic: "Universal Basic Income",
      side: "con",
      customConstraints: undefined,
    });
  });

  it("rejects an influence field that has no names", () => {
    expect(() => buildPersonaInput({ ...VALID, influences: " , , " }, "pro")).toThrow(
      "Influences must list at least one thinker or school.",
    );
  });

  it("rejects over-long topics", () => {
    expect(() => buildPersonaInput({ ...VALID, topic: "x".repeat(301) }, "pro")).toThrow(
      "Debate topic must be 300 characters or fewer.",
    );
  });
});
