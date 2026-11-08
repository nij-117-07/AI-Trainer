// src/features/prompt-generator/lib/normalize.test.ts
import { normalizePersona } from "./normalize";

describe("normalizePersona", () => {
  it("keeps the seed that was sent and fills missing model fields", () => {
    expect(normalizePersona({}, "finadv2026")).toEqual({
      personaName: "",
      systemPrompt: "",
      seedUsed: "finadv2026",
    });
  });

  it("maps the model fields", () => {
    expect(
      normalizePersona(
        { personaName: " Elena the Clarity Advisor ", generatedPersonaSystemPrompt: "You are Elena." },
        "abc12345",
      ),
    ).toEqual({
      personaName: "Elena the Clarity Advisor",
      systemPrompt: "You are Elena.",
      seedUsed: "abc12345",
    });
  });

  it("ignores values of the wrong type", () => {
    expect(normalizePersona({ personaName: 12, generatedPersonaSystemPrompt: ["x"] }, "s")).toEqual({
      personaName: "",
      systemPrompt: "",
      seedUsed: "s",
    });
  });
});
