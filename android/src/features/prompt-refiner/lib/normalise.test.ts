import { toPromptRefinerResult } from "./normalise";
import { optionalText, requireText } from "./validate";

describe("prompt refiner validate", () => {
  it("requires a prompt", () => {
    expect(() => requireText("  ", "Prompt", 100)).toThrow("Prompt is required.");
  });

  it("treats blank optional text as missing", () => {
    expect(optionalText("   ", 10)).toBeNull();
    expect(optionalText("  hi  ", 10)).toBe("hi");
  });
});

describe("prompt refiner normalise", () => {
  it("keeps the refined prompt, changes, and questions", () => {
    const result = toPromptRefinerResult({
      refinedPrompt: "Write a 100-word post.",
      changes: ["Added length limit", ""],
      clarifyingQuestions: ["Who is the audience?"],
    });
    expect(result).toEqual({
      refinedPrompt: "Write a 100-word post.",
      changes: ["Added length limit"],
      clarifyingQuestions: ["Who is the audience?"],
    });
  });

  it("falls back to empty values for bad input", () => {
    expect(toPromptRefinerResult(undefined)).toEqual({ refinedPrompt: "", changes: [], clarifyingQuestions: [] });
  });
});
