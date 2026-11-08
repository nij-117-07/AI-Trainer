// src/features/word-of-the-day/lib/normalize.test.ts
import { normalizeWordOfTheDay } from "./normalize";

describe("normalizeWordOfTheDay", () => {
  it("trims text and keeps non-empty synonyms", () => {
    const word = normalizeWordOfTheDay({
      chosenWord: "  木漏れ日 ",
      synonymWeb: [" sunlight ", "", 3 as unknown, "dappled light"],
    });
    expect(word.chosenWord).toBe("木漏れ日");
    expect(word.synonymWeb).toEqual(["sunlight", "dappled light"]);
  });

  it("splits a newline-separated synonym string", () => {
    expect(normalizeWordOfTheDay({ synonymWeb: "glade\n\n clearing " }).synonymWeb).toEqual(["glade", "clearing"]);
  });

  it("returns empty values when fields are missing", () => {
    const word = normalizeWordOfTheDay({});
    expect(word.chosenWord).toBe("");
    expect(word.synonymWeb).toEqual([]);
  });
});
