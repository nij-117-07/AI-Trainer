import { DEFAULT_LAB_FORM } from "../options";
import { parseSavedForm, readRound } from "./persistence";

describe("parseSavedForm", () => {
  it("returns the defaults when nothing is saved", () => {
    expect(parseSavedForm(null)).toEqual(DEFAULT_LAB_FORM);
  });

  it("keeps a custom language and theme", () => {
    expect(parseSavedForm({ language: "Swahili", theme: "travel" })).toEqual({ language: "Swahili", theme: "travel" });
  });
});

describe("readRound", () => {
  it("returns null when there is no usable scenario", () => {
    expect(readRound(null)).toBeNull();
    expect(readRound({ scenario: { title: "Empty" } })).toBeNull();
  });

  it("falls back per field for damaged values", () => {
    const round = readRound({
      language: "French",
      scenario: { situation: "A cat sits on a keyboard." },
      draft: 42,
      jokeStyle: "haiku",
      improvementGoal: "funnier",
      attempts: [{ joke: "Meow." }, { joke: "" }, "bad"],
      extra: { kind: "unknown" },
    });
    expect(round).toMatchObject({
      language: "French",
      draft: "",
      jokeStyle: "dad-joke",
      improvementGoal: "funnier",
      extra: null,
    });
    expect(round?.scenario).toEqual({
      title: "Untitled scenario",
      situation: "A cat sits on a keyboard.",
      audience: "general audience",
    });
    expect(round?.attempts).toHaveLength(1);
    expect(round?.attempts[0].joke).toBe("Meow.");
  });
});
