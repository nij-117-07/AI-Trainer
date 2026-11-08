// src/features/roadmap/lib/progress.test.ts
import { computeProgress, countSubtopics } from "./progress";
import type { Roadmap } from "../types";

function roadmapWith(mainPoints: Roadmap["mainPoints"]): Pick<Roadmap, "mainPoints"> {
  return { mainPoints };
}

describe("computeProgress", () => {
  it("returns zero for a roadmap with no items", () => {
    expect(computeProgress(roadmapWith([]))).toEqual({ done: 0, total: 0, percent: 0 });
  });

  it("counts main points and subpoints equally", () => {
    const progress = computeProgress(
      roadmapWith([
        {
          id: "p1",
          title: "A",
          done: true,
          milestone: "",
          subtopics: [
            { id: "s1", title: "a1", done: true },
            { id: "s2", title: "a2", done: false },
          ],
        },
        {
          id: "p2",
          title: "B",
          done: false,
          milestone: "",
          subtopics: [{ id: "s3", title: "b1", done: true }],
        },
      ]),
    );
    expect(progress).toEqual({ done: 3, total: 5, percent: 60 });
  });

  it("rounds the percentage", () => {
    const progress = computeProgress(
      roadmapWith([
        { id: "p1", title: "A", done: true, milestone: "", subtopics: [] },
        { id: "p2", title: "B", done: false, milestone: "", subtopics: [] },
        { id: "p3", title: "C", done: false, milestone: "", subtopics: [] },
      ]),
    );
    expect(progress.percent).toBe(33);
  });
});

describe("countSubtopics", () => {
  it("sums subpoints across main points", () => {
    expect(
      countSubtopics(
        roadmapWith([
          { id: "p1", title: "A", done: false, milestone: "", subtopics: [{ id: "s1", title: "x", done: false }] },
          { id: "p2", title: "B", done: false, milestone: "", subtopics: [] },
        ]),
      ),
    ).toBe(1);
  });
});
