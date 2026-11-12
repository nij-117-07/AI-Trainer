// src/features/chatbot/lib/persona-generator.test.ts
import { normalizeGeneratedPersona } from "./persona-generator";
import { DEFAULT_AVATAR, PERSONA_LIMITS } from "./persona-model";

describe("normalizeGeneratedPersona", () => {
  it("reads the generated fields and strips list markers from starters", () => {
    const result = normalizeGeneratedPersona({
      name: "  Maths Tutor ",
      description: "Helps with algebra.",
      avatar: "🧮",
      systemPrompt: "You are a patient maths tutor.",
      starters: "1. Explain factoring\n- Check my working\n\n",
    });
    expect(result).toEqual({
      name: "Maths Tutor",
      description: "Helps with algebra.",
      avatar: "🧮",
      systemPrompt: "You are a patient maths tutor.",
      starters: ["Explain factoring", "Check my working"],
    });
  });

  it("falls back to the default avatar and caps long text", () => {
    const result = normalizeGeneratedPersona({
      name: "x".repeat(200),
      description: "",
      avatar: "",
      systemPrompt: "You are helpful.",
      starters: "",
    });
    expect(result.name).toHaveLength(PERSONA_LIMITS.nameChars);
    expect(result.avatar).toBe(DEFAULT_AVATAR);
    expect(result.starters).toEqual([]);
  });

  it("throws when the model returns no name or system prompt", () => {
    expect(() => normalizeGeneratedPersona({ name: "", systemPrompt: "You are helpful." })).toThrow(
      "The assistant did not write a persona. Please try again.",
    );
    expect(() => normalizeGeneratedPersona(null)).toThrow("The assistant did not write a persona. Please try again.");
  });
});
