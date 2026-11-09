// src/features/dharma-instructor/lib/normalize.test.ts
import { normalizeTurn, sanitizeMessages } from "./normalize";
import { formatTurn, formatHistory, toHistory } from "./transcript";

describe("normalizeTurn", () => {
  it("trims the reply and keeps the teaching and practice", () => {
    expect(
      normalizeTurn({ reply: "  Breathe first.  ", dharmaTeaching: "Patience (khanti).", reflectionPractice: "Sit for 5 minutes." }),
    ).toEqual({ reply: "Breathe first.", teaching: "Patience (khanti).", practice: "Sit for 5 minutes." });
  });

  it("turns empty optional fields into null", () => {
    expect(normalizeTurn({ reply: "Hello", dharmaTeaching: "  ", reflectionPractice: undefined })).toEqual({
      reply: "Hello",
      teaching: null,
      practice: null,
    });
  });

  it("throws when the reply is missing", () => {
    expect(() => normalizeTurn({ reply: 42, dharmaTeaching: "x" })).toThrow("did not return a reply");
  });
});

describe("sanitizeMessages", () => {
  it("keeps valid messages and drops malformed ones", () => {
    expect(
      sanitizeMessages([
        { role: "user", content: " Hi " },
        { role: "assistant", content: "Welcome." },
        { role: "system", content: "nope" },
        { role: "user", content: "   " },
        "junk",
      ]),
    ).toEqual([
      { role: "user", content: "Hi" },
      { role: "assistant", content: "Welcome." },
    ]);
  });

  it("returns an empty list for non-array data", () => {
    expect(sanitizeMessages({ role: "user", content: "Hi" })).toEqual([]);
  });
});

describe("transcript", () => {
  it("formats a turn with bold labels for teaching and practice", () => {
    expect(formatTurn({ reply: "Reply.", teaching: "Metta.", practice: null })).toBe("Reply.\n\n**Teaching:** Metta.");
  });

  it("labels history lines by speaker and handles an empty history", () => {
    expect(toHistory([{ role: "user", content: "Q" }, { role: "assistant", content: "A" }])).toEqual([
      "Student: Q",
      "Instructor: A",
    ]);
    expect(formatHistory([])).toBe("No earlier conversation.");
  });
});
