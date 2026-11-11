import { normalizeNextTopicDraft } from "./draft";

describe("next-topic-suggestor draft", () => {
  it("restores saved values and falls back for an invalid level", () => {
    const draft = normalizeNextTopicDraft({
      form: { broaderTopic: "Cybersecurity", topicLevel: "Expert", customUserInput: "Short answers" },
      result: null,
    });
    expect(draft.form.broaderTopic).toBe("Cybersecurity");
    expect(draft.form.topicLevel).toBe("Beginner");
    expect(draft.form.customUserInput).toBe("Short answers");
    expect(draft.result).toBeNull();
  });

  it("restores a saved result through the normaliser", () => {
    const draft = normalizeNextTopicDraft({
      form: {},
      result: { recommendations: [{ topicName: "Session cookies", reason: "Builds on routing." }, { topicName: "" }] },
    });
    expect(draft.result).toEqual({
      recommendations: [{ topicName: "Session cookies", reason: "Builds on routing.", kept: false }],
    });
  });

  it("returns defaults for unreadable data", () => {
    const draft = normalizeNextTopicDraft(null);
    expect(draft.form.broaderTopic).toBe("");
    expect(draft.form.topicLevel).toBe("Beginner");
    expect(draft.result).toBeNull();
  });
});
