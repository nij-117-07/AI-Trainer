// src/features/language-profiles/lib/profiles.test.ts
import { DEFAULT_PROFILE, describePair, languagePair, normalizeProfilesState, validateProfile } from "./profiles";

const FRENCH = { id: "fr", name: "English to French", nativeLanguage: "English", targetLanguage: "French" };

describe("normalizeProfilesState", () => {
  it("falls back to the default profile when nothing is saved", () => {
    expect(normalizeProfilesState(null)).toEqual({
      profiles: [DEFAULT_PROFILE],
      activeProfileId: DEFAULT_PROFILE.id,
    });
  });

  it("drops broken and duplicate entries", () => {
    const state = normalizeProfilesState({
      profiles: [FRENCH, FRENCH, { id: "x", name: "", nativeLanguage: "English", targetLanguage: "Urdu" }, "bad"],
      activeProfileId: "fr",
    });
    expect(state.profiles).toEqual([FRENCH]);
    expect(state.activeProfileId).toBe("fr");
  });

  it("selects the first profile when the saved active id is missing", () => {
    const state = normalizeProfilesState({ profiles: [FRENCH], activeProfileId: "gone" });
    expect(state.activeProfileId).toBe("fr");
  });
});

describe("validateProfile", () => {
  it("accepts a complete pair", () => {
    expect(validateProfile({ name: "EN-FR", nativeLanguage: "English", targetLanguage: "French" })).toBeNull();
  });

  it("requires every field", () => {
    expect(validateProfile({ name: " ", nativeLanguage: "English", targetLanguage: "French" })).toBe(
      "Profile name is required.",
    );
    expect(validateProfile({ name: "x", nativeLanguage: "", targetLanguage: "French" })).toBe(
      "Native language is required.",
    );
    expect(validateProfile({ name: "x", nativeLanguage: "English", targetLanguage: " " })).toBe(
      "Target language is required.",
    );
  });

  it("rejects identical native and target languages", () => {
    expect(validateProfile({ name: "x", nativeLanguage: "English", targetLanguage: "english" })).toBe(
      "Native and target language must be different.",
    );
  });
});

describe("profile helpers", () => {
  it("builds the language pair and a readable label", () => {
    expect(languagePair(FRENCH)).toEqual({ nativeLanguage: "English", targetLanguage: "French" });
    expect(describePair(FRENCH)).toBe("English → French");
  });
});
