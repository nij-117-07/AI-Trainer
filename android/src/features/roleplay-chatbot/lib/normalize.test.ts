// src/features/roleplay-chatbot/lib/normalize.test.ts
import { formatHistory, normalizeTurn } from "./normalize";

describe("formatHistory", () => {
  it("returns the placeholder when there is no earlier conversation", () => {
    expect(formatHistory([], "Elara")).toBe("No previous interaction.");
  });

  it("labels user turns as User and character turns with the character name", () => {
    const text = formatHistory(
      [
        { role: "user", content: "Hello!" },
        { role: "assistant", content: "*bows* Welcome." },
      ],
      "Elara",
    );
    expect(text).toBe("[User]: Hello!\n[Elara]: *bows* Welcome.");
  });
});

describe("normalizeTurn", () => {
  it("trims the reply and fills missing tags with empty strings", () => {
    expect(normalizeTurn({ characterResponse: "  *smirks* Indeed.  " })).toEqual({
      response: "*smirks* Indeed.",
      emotion: "",
      action: "",
    });
  });

  it("returns empty values for a non-object response", () => {
    expect(normalizeTurn(undefined)).toEqual({ response: "", emotion: "", action: "" });
  });
});
