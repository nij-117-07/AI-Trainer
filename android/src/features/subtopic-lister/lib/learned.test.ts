import { formatLearned, summarizeLearned } from "./learned";

const roadmaps = [
  {
    subject: "Rust",
    mainPoints: [
      {
        id: "p1",
        title: "Ownership",
        done: true,
        milestone: "",
        subtopics: [
          { id: "s1", title: "Borrowing", done: true },
          { id: "s2", title: "Lifetimes", done: false },
        ],
      },
      {
        id: "p2",
        title: "Traits",
        done: false,
        milestone: "",
        subtopics: [{ id: "s3", title: "Generics", done: true }],
      },
    ],
  },
  {
    subject: "Piano",
    mainPoints: [
      { id: "p3", title: "Scales", done: false, milestone: "", subtopics: [{ id: "s4", title: "C major", done: false }] },
    ],
  },
];

describe("summarizeLearned", () => {
  it("collects finished main points and subtopics per subject", () => {
    expect(summarizeLearned(roadmaps)).toEqual([{ subject: "Rust", items: ["Ownership", "Borrowing", "Generics"] }]);
  });

  it("returns nothing when no item is finished", () => {
    expect(summarizeLearned([roadmaps[1]])).toEqual([]);
  });
});

describe("formatLearned", () => {
  it("writes one subject per line", () => {
    expect(formatLearned([{ subject: "Rust", items: ["Ownership", "Borrowing"] }, { subject: "Go", items: ["Structs"] }])).toBe(
      "Rust: Ownership; Borrowing\nGo: Structs",
    );
  });

  it("returns an empty string when nothing is learned", () => {
    expect(formatLearned([])).toBe("");
  });
});
