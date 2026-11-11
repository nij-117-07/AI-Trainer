// src/features/topic-of-the-day/lib/library.test.ts
import type { SavedTopic } from "../types";
import {
  addBroadTopic,
  addTopic,
  deleteBroadTopic,
  deleteTopics,
  EMPTY_TOPIC_LIBRARY,
  renameBroadTopic,
  sanitizeLibrary,
  topicsFor,
} from "./library";

function savedTopic(id: string, broadId: string, createdAt: number): SavedTopic {
  return {
    id,
    broadId,
    focus: "",
    createdAt,
    date: "2026-11-10",
    title: id,
    whyItMatters: "",
    keyIdeas: [],
    explanation: "",
    workedExample: "",
    starterQuestion: "",
    tryToday: "",
  };
}

describe("broader topics", () => {
  it("adds, renames, and deletes a broader topic", () => {
    const withBiology = addBroadTopic(EMPTY_TOPIC_LIBRARY, "Biology");
    const id = withBiology.broadTopics[0].id;
    expect(renameBroadTopic(withBiology, id, "Cell biology").broadTopics[0].name).toBe("Cell biology");
    expect(deleteBroadTopic(withBiology, id).broadTopics).toEqual([]);
  });

  it("deleting a broader topic also removes its topics only", () => {
    let library = addBroadTopic(EMPTY_TOPIC_LIBRARY, "Biology");
    const biology = library.broadTopics[0].id;
    library = addBroadTopic(library, "Chemistry");
    const chemistry = library.broadTopics[1].id;
    library = addTopic(addTopic(library, savedTopic("a", biology, 1)), savedTopic("b", chemistry, 2));

    const after = deleteBroadTopic(library, biology);
    expect(after.topics.map((topic) => topic.id)).toEqual(["b"]);
  });
});

describe("topics", () => {
  it("lists one broader topic's topics newest first", () => {
    let library = addBroadTopic(EMPTY_TOPIC_LIBRARY, "Biology");
    const biology = library.broadTopics[0].id;
    library = addTopic(library, savedTopic("old", biology, 1));
    library = addTopic(library, savedTopic("new", biology, 5));

    expect(topicsFor(library, biology).map((topic) => topic.id)).toEqual(["new", "old"]);
  });

  it("deletes several topics at once and keeps the rest", () => {
    let library = addBroadTopic(EMPTY_TOPIC_LIBRARY, "Biology");
    const biology = library.broadTopics[0].id;
    library = addTopic(library, savedTopic("a", biology, 1));
    library = addTopic(library, savedTopic("b", biology, 2));
    library = addTopic(library, savedTopic("c", biology, 3));
    expect(deleteTopics(library, ["a", "c"]).topics.map((topic) => topic.id)).toEqual(["b"]);
  });
});

describe("sanitizeLibrary", () => {
  it("drops malformed entries and keeps the valid ones", () => {
    const library = sanitizeLibrary({
      broadTopics: [{ id: "b1", name: "Biology" }, { id: "", name: "No id" }, "bad"],
      topics: [{ id: "t1", broadId: "b1", title: "Cells", createdAt: 5 }, { id: "t2" }],
    });

    expect(library.broadTopics).toEqual([{ id: "b1", name: "Biology" }]);
    expect(library.topics.map((topic) => topic.id)).toEqual(["t1"]);
    expect(library.topics[0].title).toBe("Cells");
  });

  it("returns an empty library for a non-object value", () => {
    expect(sanitizeLibrary(null)).toEqual(EMPTY_TOPIC_LIBRARY);
  });
});
