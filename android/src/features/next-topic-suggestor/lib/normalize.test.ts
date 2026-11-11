import { normalizeRecommendations } from "./normalize";

describe("next-topic-suggestor normalize", () => {
  it("keeps valid recommendations and drops ones without a name", () => {
    const result = normalizeRecommendations({
      recommendations: [
        { topicName: "Session cookies", reason: "Builds on routing." },
        { topicName: "", reason: "ignored" },
        null,
      ],
    });
    expect(result).toEqual({
      recommendations: [{ topicName: "Session cookies", reason: "Builds on routing.", kept: false }],
    });
  });

  it("returns an empty list for bad input", () => {
    expect(normalizeRecommendations(null).recommendations).toEqual([]);
  });

  it("defaults kept to false and keeps a saved kept flag", () => {
    const result = normalizeRecommendations({
      recommendations: [
        { topicName: "Session cookies", reason: "" },
        { topicName: "CSRF", reason: "", kept: true },
      ],
    });
    expect(result.recommendations.map((item) => item.kept)).toEqual([false, true]);
  });
});
