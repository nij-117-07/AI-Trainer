// src/features/diagram/lib/normalize.test.ts
import { normalizeDiagram, stripCodeFence } from "./normalize";

describe("stripCodeFence", () => {
  it("removes a markdown fence around the code", () => {
    expect(stripCodeFence("```mermaid\ngraph TD\nA-->B\n```")).toBe("graph TD\nA-->B");
  });

  it("leaves unfenced code alone", () => {
    expect(stripCodeFence("  graph LR\nA-->B  ")).toBe("graph LR\nA-->B");
  });
});

describe("normalizeDiagram", () => {
  it("returns trimmed code and message with the requested format", () => {
    expect(normalizeDiagram({ updatedCode: " graph TD\nA-->B ", answerMessage: " Added B. " }, "mermaid")).toEqual({
      code: "graph TD\nA-->B",
      message: "Added B.",
      format: "mermaid",
    });
  });

  it("tolerates a missing message", () => {
    expect(normalizeDiagram({ updatedCode: "<mxGraphModel/>" }, "drawio")).toEqual({
      code: "<mxGraphModel/>",
      message: "",
      format: "drawio",
    });
  });

  it("rejects output with no diagram code", () => {
    expect(() => normalizeDiagram({ answerMessage: "Done" }, "mermaid")).toThrow(
      "The model did not return any diagram code. Try again.",
    );
  });
});
