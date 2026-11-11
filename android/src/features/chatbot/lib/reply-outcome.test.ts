// src/features/chatbot/lib/reply-outcome.test.ts
import { replyOutcome } from "./reply-outcome";

describe("replyOutcome", () => {
  it("marks a finished reply as done", () => {
    expect(replyOutcome({ reply: "Hello", failure: null, stopped: false })).toEqual({
      status: "done",
      content: "Hello",
      error: null,
    });
  });

  it("keeps the partial text of a reply the user stopped", () => {
    expect(replyOutcome({ reply: "Part", failure: null, stopped: true })).toEqual({
      status: "stopped",
      content: "Part",
      error: null,
    });
  });

  it("marks a reply stopped before any text arrived as stopped with no text", () => {
    expect(replyOutcome({ reply: "", failure: null, stopped: true })).toEqual({
      status: "stopped",
      content: "",
      error: null,
    });
  });

  it("keeps partial text and the failure when a request fails", () => {
    expect(replyOutcome({ reply: "Part", failure: "Connection lost.", stopped: false })).toEqual({
      status: "error",
      content: "Part",
      error: "Connection lost.",
    });
  });

  it("reports an empty finished reply as an error", () => {
    expect(replyOutcome({ reply: "  ", failure: null, stopped: false })).toEqual({
      status: "error",
      content: "",
      error: "The model returned an empty reply.",
    });
  });
});
