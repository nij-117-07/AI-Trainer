// src/features/motivation/lib/normalise.test.ts
import { localDateString, listOf, optionalText, requireText, textOf } from "./normalise";
import { restoreQuoteDraft, restoreReflectionDraft, QUOTE_DEFAULTS, REFLECTION_DEFAULTS } from "./drafts";
import { isQuoteType } from "./types";

describe("input checks", () => {
  it("trims required text and rejects blanks or overlong values", () => {
    expect(requireText("  Resilience  ", "Seed topic", 200)).toBe("Resilience");
    expect(() => requireText("   ", "Seed topic", 200)).toThrow("Seed topic is required.");
    expect(() => requireText("x".repeat(501), "How you feel", 500)).toThrow("How you feel must be 500 characters or fewer.");
  });

  it("returns undefined for empty optional text", () => {
    expect(optionalText("   ", 1000)).toBeUndefined();
    expect(optionalText(" trends ", 1000)).toBe("trends");
  });

  it("recognises only the four quote styles", () => {
    expect(isQuoteType("tough-love")).toBe(true);
    expect(isQuoteType("funny")).toBe(false);
    expect(isQuoteType(undefined)).toBe(false);
  });
});

describe("tolerant readers", () => {
  it("returns an empty list for anything that is not an array", () => {
    expect(listOf<string>(undefined)).toEqual([]);
    expect(listOf<string>("one")).toEqual([]);
    expect(listOf<string>(["a"])).toEqual(["a"]);
  });

  it("returns an empty string for non-text values", () => {
    expect(textOf(null)).toBe("");
    expect(textOf(42)).toBe("");
    expect(textOf("ok")).toBe("ok");
  });

  it("formats the local date as YYYY-MM-DD", () => {
    expect(localDateString(new Date(2026, 0, 5, 12))).toBe("2026-01-05");
  });
});

describe("draft restore", () => {
  it("falls back to defaults when the stored draft is damaged", () => {
    const restored = restoreQuoteDraft({ form: { seedTopic: 7, quoteType: "bogus" }, result: "nope" });
    expect(restored.form).toEqual(QUOTE_DEFAULTS);
    expect(restored.result).toBeNull();
  });

  it("keeps valid fields and normalises a saved reflection result", () => {
    const restored = restoreReflectionDraft({
      form: { currentMood: "Tired", goalAlignment: 3 },
      result: { prompts: ["Why?", 4, null], perspectiveShift: "What if?" },
    });
    expect(restored.form.currentMood).toBe("Tired");
    expect(restored.form.goalAlignment).toBe(REFLECTION_DEFAULTS.goalAlignment);
    expect(restored.result).toEqual({ prompts: ["Why?"], perspectiveShift: "What if?" });
  });

  it("restores a saved quote with its style", () => {
    const restored = restoreQuoteDraft({
      form: { seedTopic: "Loss", quoteType: "poetic", userFeeling: "Sad" },
      result: { quote: "Q", authorPersona: "P", actionableInsight: "A", currentDate: "2026-01-05" },
    });
    expect(restored.form).toEqual({ seedTopic: "Loss", quoteType: "poetic", userFeeling: "Sad" });
    expect(restored.result?.quote).toBe("Q");
  });
});
