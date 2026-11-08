import { normalizeReply } from "./normalize";

describe("normalizeReply", () => {
  it("returns the trimmed reply", () => {
    expect(normalizeReply({ responseMessage: "  Bonjour.  " })).toBe("Bonjour.");
  });

  it("throws when the model returned no reply", () => {
    expect(() => normalizeReply({})).toThrow("The persona did not reply. Please try again.");
    expect(() => normalizeReply(null)).toThrow();
  });
});
