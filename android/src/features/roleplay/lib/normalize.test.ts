import { SYSTEM_PROMPT_MAX } from "../options";
import { normalizeReply, normalizeSystemPrompt } from "./normalize";

describe("normalizeReply", () => {
  it("returns the trimmed reply", () => {
    expect(normalizeReply({ responseMessage: "  Bonjour.  " })).toBe("Bonjour.");
  });

  it("throws when the model returned no reply", () => {
    expect(() => normalizeReply({})).toThrow("The persona did not reply. Please try again.");
    expect(() => normalizeReply(null)).toThrow();
  });
});

describe("normalizeSystemPrompt", () => {
  it("returns the trimmed prompt", () => {
    expect(normalizeSystemPrompt({ systemPrompt: "  You are a waiter.  " })).toBe("You are a waiter.");
  });

  it("caps the prompt to the field limit", () => {
    const long = "a".repeat(SYSTEM_PROMPT_MAX + 50);
    expect(normalizeSystemPrompt({ systemPrompt: long })).toHaveLength(SYSTEM_PROMPT_MAX);
  });

  it("throws when the model wrote no prompt", () => {
    expect(() => normalizeSystemPrompt({ systemPrompt: "   " })).toThrow(
      "The assistant did not write a prompt. Please try again.",
    );
  });
});
