// src/features/chatbot/lib/voice-text.test.ts
import { appendTranscript, formatElapsed } from "./voice-text";

describe("appendTranscript", () => {
  it("uses the transcript alone when the draft is empty", () => {
    expect(appendTranscript("", "  hello there ")).toBe("hello there");
  });

  it("adds the transcript after the existing draft with one space", () => {
    expect(appendTranscript("Hi  \n", "there")).toBe("Hi there");
  });

  it("keeps the draft when the transcript is blank", () => {
    expect(appendTranscript("draft", "   ")).toBe("draft");
  });
});

describe("formatElapsed", () => {
  it("formats minutes and seconds", () => {
    expect(formatElapsed(65000)).toBe("1:05");
    expect(formatElapsed(0)).toBe("0:00");
  });
});
