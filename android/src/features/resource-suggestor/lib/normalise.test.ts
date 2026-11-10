// src/features/resource-suggestor/lib/normalise.test.ts
import { toResourceDraft, toResourceResult } from "./normalise";
import { preferencesOrDefault, requireText, NO_PREFERENCES } from "./validate";
import type { ResourceSuggestorFormValues } from "../types";

const defaults: ResourceSuggestorFormValues = {
  backgroundSubject: "",
  targetTopic: "",
  resourceType: "any",
  additionalPreferences: "",
};

describe("validation", () => {
  it("requires non-blank subjects within the limit", () => {
    expect(requireText("  Math ", "Target topic", 500)).toBe("Math");
    expect(() => requireText(" ", "Target topic", 500)).toThrow("Target topic is required.");
    expect(() => requireText("x".repeat(501), "Target topic", 500)).toThrow(
      "Target topic must be 500 characters or fewer.",
    );
  });

  it("uses the backend default when no preferences are given", () => {
    expect(preferencesOrDefault("   ")).toBe(NO_PREFERENCES);
    expect(preferencesOrDefault(" videos ")).toBe("videos");
  });
});

describe("toResourceResult", () => {
  it("returns empty values for a missing payload", () => {
    expect(toResourceResult(undefined)).toEqual({
      recommendedResources: [],
      nextSteps: "",
    });
  });

  it("maps resources field by field and ignores non-list resources", () => {
    const result = toResourceResult({
      recommendedResources: [{ title: "Book", type: "book", estimatedTime: 3 }, "bad"],
      nextSteps: "Read, then build.",
    });
    expect(result.recommendedResources[0]).toEqual({
      title: "Book",
      type: "book",
      authorOrCreator: "",
      description: "",
      difficultyLevel: "",
      estimatedTime: "3",
      accessInfo: "",
    });
    expect(result.recommendedResources[1].title).toBe("");
    expect(toResourceResult({ recommendedResources: "none" }).recommendedResources).toEqual([]);
  });
});

describe("toResourceDraft", () => {
  it("restores a valid draft and falls back for corrupt fields", () => {
    const draft = toResourceDraft({ form: { targetTopic: 42 }, result: { nextSteps: "Go" } }, defaults);
    expect(draft.form.targetTopic).toBe(defaults.targetTopic);
    expect(draft.form.backgroundSubject).toBe(defaults.backgroundSubject);
    expect(draft.result?.nextSteps).toBe("Go");
  });

  it("drops the result when none was saved", () => {
    expect(toResourceDraft({ form: defaults }, defaults).result).toBeNull();
  });

  it("keeps a known resource type and falls back for an unknown one", () => {
    expect(toResourceDraft({ form: { resourceType: "book" } }, defaults).form.resourceType).toBe("book");
    expect(toResourceDraft({ form: { resourceType: "video_game" } }, defaults).form.resourceType).toBe("any");
  });
});
