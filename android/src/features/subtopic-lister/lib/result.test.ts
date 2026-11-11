import { mergeSubtopicBatch, toggleSubtopicKept } from "./result";
import type { SubtopicResult } from "../types";

const item = (name: string, kept = false) => ({ name, description: "", kept });

describe("subtopic-lister result", () => {
  it("keeps ticked subtopics and replaces the rest when a new batch arrives", () => {
    const previous: SubtopicResult = { subtopics: [item("Loops", true), item("Arrays")] };
    const generated: SubtopicResult = { subtopics: [item("Recursion"), item("loops")] };
    expect(mergeSubtopicBatch(previous, generated).subtopics).toEqual([item("Loops", true), item("Recursion")]);
  });

  it("starts a batch with nothing kept when there is no previous result", () => {
    const generated: SubtopicResult = { subtopics: [item("Loops", true)] };
    expect(mergeSubtopicBatch(null, generated).subtopics).toEqual([item("Loops")]);
  });

  it("toggles one subtopic without changing the others", () => {
    const result: SubtopicResult = { subtopics: [item("Loops"), item("Arrays")] };
    expect(toggleSubtopicKept(result, 1).subtopics).toEqual([item("Loops"), item("Arrays", true)]);
  });
});
