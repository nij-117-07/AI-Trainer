import { oneLineSummary } from "./text";

describe("oneLineSummary", () => {
  it("returns the first non-empty line without markdown marks", () => {
    expect(oneLineSummary("\n**Present perfect:** uses haber.\nMore detail.")).toBe("Present perfect: uses haber.");
  });

  it("strips list markers", () => {
    expect(oneLineSummary("- Más vale pronto.\n- Otra.")).toBe("Más vale pronto.");
  });

  it("cuts long text to the limit with an ellipsis", () => {
    const summary = oneLineSummary("abcdefghij", 5);
    expect(summary).toBe("abcd…");
  });

  it("returns an empty string for empty text", () => {
    expect(oneLineSummary("  \n ")).toBe("");
  });
});
