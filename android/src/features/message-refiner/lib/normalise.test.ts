import { toMessageRefinerResult } from "./normalise";
import { requireText } from "./validate";

describe("message refiner validate", () => {
  it("rejects a message over the limit", () => {
    expect(() => requireText("abcdef", "Message", 3)).toThrow("Message must be 3 characters or fewer.");
  });
});

describe("message refiner normalise", () => {
  it("keeps the message, subject, and changes", () => {
    const result = toMessageRefinerResult({
      refinedMessage: "Hi Sam, could we move our call to 3pm?",
      subjectLine: "Moving our call",
      changes: ["Made the request specific"],
    });
    expect(result).toEqual({
      refinedMessage: "Hi Sam, could we move our call to 3pm?",
      subjectLine: "Moving our call",
      changes: ["Made the request specific"],
    });
  });

  it("returns empty fields when the model output is missing", () => {
    expect(toMessageRefinerResult(null)).toEqual({ refinedMessage: "", subjectLine: "", changes: [] });
  });
});
