// src/features/chatbot/lib/thread-model.test.ts
import { createMessage, createThread, normalizeMessages, normalizeThreads, sortThreads, threadsForPersona, titleFrom } from "./thread-model";

describe("titleFrom", () => {
  it("collapses whitespace and shortens long text", () => {
    expect(titleFrom("  Hello\n\nthere  ")).toBe("Hello there");
    expect(titleFrom("a".repeat(80))).toHaveLength(49);
  });

  it("uses a fallback for empty text", () => {
    expect(titleFrom("   ")).toBe("New chat");
  });
});

describe("threads", () => {
  const threads = [
    { id: "t1", personaId: "a", title: "old", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
    { id: "t2", personaId: "b", title: "other", createdAt: "2026-01-02T00:00:00.000Z", updatedAt: "2026-01-02T00:00:00.000Z" },
    { id: "t3", personaId: "a", title: "new", createdAt: "2026-01-03T00:00:00.000Z", updatedAt: "2026-01-03T00:00:00.000Z" },
  ];

  it("lists one persona's chats, newest first", () => {
    expect(threadsForPersona(threads, "a").map((t) => t.id)).toEqual(["t3", "t1"]);
  });

  it("sorts by last update", () => {
    expect(sortThreads(threads)[0].id).toBe("t3");
  });

  it("creates a chat with the persona and title", () => {
    const thread = createThread("a", "Hi", "2026-01-04T00:00:00.000Z");
    expect(thread).toMatchObject({ personaId: "a", title: "Hi", createdAt: thread.updatedAt });
    expect(thread.id).toMatch(/^thread-/);
  });

  it("drops saved chats without an id or persona", () => {
    expect(normalizeThreads([{ id: "x" }, { id: "y", personaId: "a" }])).toHaveLength(1);
  });
});

describe("messages", () => {
  it("creates a user or assistant message with a fresh id", () => {
    const message = createMessage("user", "Hi", "done");
    expect(message).toMatchObject({ role: "user", content: "Hi", status: "done", error: null });
    expect(message.id).toMatch(/^msg-/);
  });

  it("marks a reply that was still streaming as interrupted", () => {
    const [message] = normalizeMessages([{ id: "m", role: "assistant", content: "Part", status: "streaming" }]);
    expect(message.status).toBe("error");
    expect(message.content).toBe("Part");
    expect(message.error).toContain("interrupted");
  });

  it("drops messages with an unknown role", () => {
    expect(normalizeMessages([{ id: "m", role: "system", content: "x" }])).toEqual([]);
  });
});
