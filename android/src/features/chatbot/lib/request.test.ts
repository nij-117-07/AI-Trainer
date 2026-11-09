// src/features/chatbot/lib/request.test.ts
import { buildRequestBody, buildRequestMessages, completionsEndpoint, describeHttpError, parseStreamLine, readCompletionText } from "./request";
import type { ChatMessage } from "../types";

function message(role: "user" | "assistant", content: string, status: ChatMessage["status"] = "done"): ChatMessage {
  return { id: `${role}-${content}`, role, content, status, error: null, createdAt: "2026-01-01T00:00:00.000Z" };
}

describe("completionsEndpoint", () => {
  it("appends the chat path and trims trailing slashes", () => {
    expect(completionsEndpoint("https://openrouter.ai/api/v1/")).toBe("https://openrouter.ai/api/v1/chat/completions");
  });

  it("falls back to the OpenAI base URL when none is set", () => {
    expect(completionsEndpoint("  ")).toBe("https://api.openai.com/v1/chat/completions");
  });
});

describe("buildRequestMessages", () => {
  it("puts the system prompt first and skips empty or unfinished messages", () => {
    const history = [
      message("user", "Hi"),
      message("assistant", "Hello"),
      message("user", ""),
      message("assistant", "partial", "streaming"),
      message("assistant", "failed", "error"),
    ];
    expect(buildRequestMessages(" Be brief. ", history, 30)).toEqual([
      { role: "system", content: "Be brief." },
      { role: "user", content: "Hi" },
      { role: "assistant", content: "Hello" },
    ]);
  });

  it("omits the system message when the prompt is blank", () => {
    expect(buildRequestMessages("  ", [message("user", "Hi")], 30)).toEqual([{ role: "user", content: "Hi" }]);
  });

  it("keeps only the most recent messages up to the history limit", () => {
    const history = [message("user", "one"), message("assistant", "two"), message("user", "three")];
    expect(buildRequestMessages("", history, 2).map((m) => m.content)).toEqual(["two", "three"]);
  });
});

describe("buildRequestBody", () => {
  it("sends the sampling settings and omits max_tokens when it is 0", () => {
    const body = JSON.parse(buildRequestBody(" m ", [], { temperature: 0.4, topP: 0.9, maxTokens: 0 }, true));
    expect(body).toEqual({ model: "m", messages: [], temperature: 0.4, top_p: 0.9, stream: true });
  });

  it("includes max_tokens when a limit is set", () => {
    const body = JSON.parse(buildRequestBody("m", [], { temperature: 1, topP: 1, maxTokens: 256 }, false));
    expect(body.max_tokens).toBe(256);
    expect(body.stream).toBe(false);
  });
});

describe("parseStreamLine", () => {
  it("reads a content delta", () => {
    expect(parseStreamLine('data: {"choices":[{"delta":{"content":"Hel"}}]}')).toEqual({ type: "delta", text: "Hel" });
  });

  it("recognises the end marker", () => {
    expect(parseStreamLine("data: [DONE]")).toEqual({ type: "done" });
  });

  it("ignores blank lines, comments, role-only deltas, and bad JSON", () => {
    expect(parseStreamLine("")).toBeNull();
    expect(parseStreamLine(": keep-alive")).toBeNull();
    expect(parseStreamLine('data: {"choices":[{"delta":{"role":"assistant"}}]}')).toBeNull();
    expect(parseStreamLine("data: {not json")).toBeNull();
  });
});

describe("readCompletionText", () => {
  it("returns the message content of a full reply", () => {
    expect(readCompletionText('{"choices":[{"message":{"content":"Hi there"}}]}')).toBe("Hi there");
  });

  it("throws when the reply is empty", () => {
    expect(() => readCompletionText('{"choices":[]}')).toThrow("The model returned an empty reply.");
  });
});

describe("describeHttpError", () => {
  it("adds the host, the provider message, and a key hint on 401", () => {
    expect(describeHttpError(401, "openrouter.ai", '{"error":{"message":"Invalid key."}}')).toBe(
      "Chat request failed (401) from openrouter.ai: Invalid key. Check the chat API key in AI settings.",
    );
  });

  it("explains when the base URL returns a web page", () => {
    expect(describeHttpError(200, "example.com", "<!doctype html><html></html>")).toContain("returned a web page");
  });
});
