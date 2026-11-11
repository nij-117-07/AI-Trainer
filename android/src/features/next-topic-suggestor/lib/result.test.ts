import { mergeTopicBatch, toggleTopicKept } from "./result";
import type { NextTopicResult } from "../types";

const item = (topicName: string, kept = false) => ({ topicName, reason: "", kept });

describe("next-topic-suggestor result", () => {
  it("keeps ticked topics and replaces the rest when a new batch arrives", () => {
    const previous: NextTopicResult = { recommendations: [item("Sessions", true), item("Routing")] };
    const generated: NextTopicResult = { recommendations: [item("CSRF"), item("sessions")] };
    expect(mergeTopicBatch(previous, generated).recommendations).toEqual([item("Sessions", true), item("CSRF")]);
  });

  it("starts a batch with nothing kept when there is no previous result", () => {
    const generated: NextTopicResult = { recommendations: [item("CSRF", true)] };
    expect(mergeTopicBatch(null, generated).recommendations).toEqual([item("CSRF")]);
  });

  it("toggles one topic without changing the others", () => {
    const result: NextTopicResult = { recommendations: [item("Sessions"), item("Routing")] };
    expect(toggleTopicKept(result, 0).recommendations).toEqual([item("Sessions", true), item("Routing")]);
  });
});
