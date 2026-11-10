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
      recommendations: [{ topicName: "Session cookies", reason: "Builds on routing." }],
    });
  });

  it("returns an empty list for bad input", () => {
    expect(normalizeRecommendations(null).recommendations).toEqual([]);
  });
});
