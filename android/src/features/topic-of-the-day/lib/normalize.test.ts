// src/features/topic-of-the-day/lib/normalize.test.ts
import { normalizeTopicOfTheDay } from "./normalize";

describe("normalizeTopicOfTheDay", () => {
  it("trims text, drops blank list items, and fills missing fields with empty values", () => {
    const topic = normalizeTopicOfTheDay(
      { title: "  Photosynthesis ", keyIdeas: ["Light", " ", "Water"], explanation: 42 },
      "2026-11-10",
    );
    expect(topic.date).toBe("2026-11-10");
    expect(topic.title).toBe("Photosynthesis");
    expect(topic.keyIdeas).toEqual(["Light", "Water"]);
    expect(topic.explanation).toBe("");
    expect(topic.tryToday).toBe("");
  });
});
