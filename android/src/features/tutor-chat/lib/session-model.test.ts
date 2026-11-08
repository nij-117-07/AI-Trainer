// src/features/tutor-chat/lib/session-model.test.ts
import {
  NO_HISTORY_TEXT,
  appendTurn,
  createSession,
  formatHistory,
  normaliseSession,
  normaliseSessions,
  removeSession,
  requireUserInput,
  sameSettings,
  summarise,
  trimHistory,
  updateSettings,
  validateSettings,
} from "./session-model";
import type { ChatMessage, TutorChatSession } from "./types";

const NOW = "2026-01-02T00:00:00.000Z";

function session(overrides: Partial<TutorChatSession> = {}): TutorChatSession {
  return {
    id: "s1",
    masterTopic: "Physics",
    additionalContext: "",
    chatHistory: [],
    breakdowns: [],
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

describe("validateSettings", () => {
  it("trims the topic and context", () => {
    expect(validateSettings({ masterTopic: "  Physics ", additionalContext: " beginner  " })).toEqual({
      masterTopic: "Physics",
      additionalContext: "beginner",
    });
  });

  it("requires a topic of at least two characters", () => {
    expect(() => validateSettings({ masterTopic: " a ", additionalContext: "" })).toThrow("Master topic is required.");
  });

  it("rejects a topic over 300 characters", () => {
    expect(() => validateSettings({ masterTopic: "x".repeat(301), additionalContext: "" })).toThrow(
      "Master topic must be 300 characters or fewer.",
    );
  });

  it("rejects context over 2000 characters", () => {
    expect(() => validateSettings({ masterTopic: "Physics", additionalContext: "x".repeat(2001) })).toThrow(
      "2000 characters",
    );
  });
});

describe("requireUserInput", () => {
  it("returns the trimmed question", () => {
    expect(requireUserInput("  why?  ")).toBe("why?");
  });

  it("rejects a blank question", () => {
    expect(() => requireUserInput("   ")).toThrow("Type a question first.");
  });
});

describe("session CRUD", () => {
  it("creates an empty session with trimmed settings", () => {
    const created = createSession({ masterTopic: " Physics ", additionalContext: "" }, "abc", NOW);
    expect(created).toEqual({
      id: "abc",
      masterTopic: "Physics",
      additionalContext: "",
      chatHistory: [],
      breakdowns: [],
      createdAt: NOW,
      updatedAt: NOW,
    });
  });

  it("updates settings and bumps updatedAt", () => {
    const later = "2026-02-01T00:00:00.000Z";
    const updated = updateSettings(session(), { masterTopic: "Chemistry", additionalContext: "exam prep" }, later);
    expect(updated.masterTopic).toBe("Chemistry");
    expect(updated.additionalContext).toBe("exam prep");
    expect(updated.updatedAt).toBe(later);
    expect(updated.createdAt).toBe(NOW);
  });

  it("detects unsaved settings changes, ignoring surrounding spaces", () => {
    expect(sameSettings(session(), { masterTopic: " Physics ", additionalContext: "" })).toBe(true);
    expect(sameSettings(session(), { masterTopic: "Physics", additionalContext: "new" })).toBe(false);
  });

  it("appends the question and reply, and the breakdown in parallel", () => {
    const later = "2026-03-01T00:00:00.000Z";
    const updated = appendTurn(
      session(),
      "What is force?",
      {
        tutorResponse: "Force is a push or pull.",
        educationalBreakdown: [{ title: "Force", description: "A push or pull." }],
      },
      later,
    );
    expect(updated.chatHistory).toEqual([
      { role: "user", content: "What is force?" },
      { role: "assistant", content: "Force is a push or pull." },
    ]);
    expect(updated.breakdowns).toEqual([[{ title: "Force", description: "A push or pull." }]]);
    expect(updated.updatedAt).toBe(later);
  });

  it("removes a session by id", () => {
    const list = [session({ id: "a" }), session({ id: "b" })];
    expect(removeSession(list, "a").map((item) => item.id)).toEqual(["b"]);
  });

  it("summarises the message count and last message", () => {
    const withTurns = session({
      chatHistory: [
        { role: "user", content: "hi" },
        { role: "assistant", content: "hello there" },
      ],
    });
    expect(summarise(withTurns)).toEqual({
      id: "s1",
      masterTopic: "Physics",
      updatedAt: NOW,
      messageCount: 2,
      lastMessage: "hello there",
    });
  });
});

describe("history for the model", () => {
  it("returns the no-history text when empty", () => {
    expect(formatHistory([])).toBe(NO_HISTORY_TEXT);
  });

  it("joins role-tagged turns with a pipe", () => {
    const messages: ChatMessage[] = [
      { role: "user", content: "What is an atom?" },
      { role: "assistant", content: "A building block." },
    ];
    expect(formatHistory(messages)).toBe("user: What is an atom? | assistant: A building block.");
  });

  it("keeps only the newest messages within the count limit", () => {
    const messages: ChatMessage[] = Array.from({ length: 35 }, (_, i) => ({ role: "user", content: `m${i}` }));
    const kept = trimHistory(messages);
    expect(kept).toHaveLength(30);
    expect(kept[0].content).toBe("m5");
    expect(kept[kept.length - 1].content).toBe("m34");
  });

  it("stops at the character budget but always keeps the newest message", () => {
    const messages: ChatMessage[] = Array.from({ length: 10 }, (_, i) => ({
      role: "user",
      content: `${i}`.padEnd(1000, "x"),
    }));
    expect(trimHistory(messages)).toHaveLength(8);
    const huge: ChatMessage[] = [{ role: "user", content: "y".repeat(9000) }];
    expect(trimHistory(huge)).toHaveLength(1);
  });
});

describe("normalising stored sessions", () => {
  it("drops invalid messages and breakdown items", () => {
    const result = normaliseSession({
      id: "s1",
      masterTopic: "Physics",
      chatHistory: [
        { role: "user", content: "hi" },
        { role: "system", content: "ignored" },
        "not a message",
        { role: "assistant" },
      ],
      breakdowns: [[{ title: "Force", description: "push" }, null, { title: "", description: "" }], "bad"],
    });
    expect(result?.chatHistory).toEqual([
      { role: "user", content: "hi" },
      { role: "assistant", content: "" },
    ]);
    expect(result?.breakdowns).toEqual([[{ title: "Force", description: "push" }], []]);
  });

  it("falls back to safe defaults when fields are missing", () => {
    const result = normaliseSession({ id: "s2", chatHistory: "nope" });
    expect(result).toEqual({
      id: "s2",
      masterTopic: "",
      additionalContext: "",
      chatHistory: [],
      breakdowns: [],
      createdAt: "1970-01-01T00:00:00.000Z",
      updatedAt: "1970-01-01T00:00:00.000Z",
    });
  });

  it("rejects sessions without an id and non-list storage", () => {
    expect(normaliseSession({ masterTopic: "Physics" })).toBeNull();
    expect(normaliseSessions({ not: "a list" })).toEqual([]);
    expect(normaliseSessions([null, { id: "ok" }]).map((item) => item.id)).toEqual(["ok"]);
  });
});
