// src/features/charts/lib/normalize.test.ts
import { normalizeChart } from "./normalize";

describe("normalizeChart", () => {
  it("trims the explanation and the generated code", () => {
    expect(normalizeChart({ answerMessage: " Bar chart. ", chartDivCode: "<div></div>\n" })).toEqual({
      answerMessage: "Bar chart.",
      chartDivCode: "<div></div>",
    });
  });

  it("returns empty text when the model omits fields or returns the wrong type", () => {
    expect(normalizeChart({})).toEqual({ answerMessage: "", chartDivCode: "" });
    expect(normalizeChart({ answerMessage: ["x"], chartDivCode: 42 })).toEqual({ answerMessage: "", chartDivCode: "" });
  });
});
