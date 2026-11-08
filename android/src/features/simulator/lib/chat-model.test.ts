// src/features/simulator/lib/chat-model.test.ts
import { NO_HISTORY_TEXT, appendUserMessage, checkChatSettings, formatHistory } from "./chat-model";
import { normaliseChatState, normaliseRunState } from "./state";

describe("checkChatSettings", () => {
  it("returns trimmed settings", () => {
    expect(checkChatSettings({ persona: " Captain ", scenario: " Storm " })).toEqual({
      persona: "Captain",
      scenario: "Storm",
    });
  });

  it("asks for both a persona and a scenario", () => {
    expect(() => checkChatSettings({ persona: "Captain", scenario: "  " })).toThrow(
      "Set both a persona and a scenario before starting the conversation.",
    );
  });
});

describe("formatHistory", () => {
  it("says when there is no history", () => {
    expect(formatHistory([])).toBe(NO_HISTORY_TEXT);
  });

  it("writes one role-prefixed line per message", () => {
    expect(
      formatHistory([
        { role: "user", content: "Hello", thought: "" },
        { role: "assistant", content: "Report.", thought: "Calm." },
      ]),
    ).toBe("user: Hello\nassistant: Report.");
  });
});

describe("appendUserMessage", () => {
  it("adds the user line without a thought", () => {
    expect(appendUserMessage([], "Hi")).toEqual([{ role: "user", content: "Hi", thought: "" }]);
  });
});

describe("normaliseChatState", () => {
  it("falls back to defaults for an empty document", () => {
    const state = normaliseChatState(null);
    expect(state.persona).toBe("A pragmatic retired starship captain.");
    expect(state.draft).toBe("");
    expect(state.history).toEqual([]);
  });

  it("drops messages with an unknown role", () => {
    const state = normaliseChatState({
      persona: "Pilot",
      history: [
        { role: "assistant", content: "Ready.", thought: "Eager." },
        { role: "system", content: "x" },
        "junk",
      ],
    });
    expect(state.persona).toBe("Pilot");
    expect(state.history).toEqual([{ role: "assistant", content: "Ready.", thought: "Eager." }]);
  });
});

describe("normaliseRunState", () => {
  it("keeps saved fields with the right type and drops a damaged result", () => {
    const state = normaliseRunState({ form: { persona: 5, scenario: "Dock" }, result: "bad" });
    expect(state.form.persona).toBe("A pragmatic retired starship captain.");
    expect(state.form.scenario).toBe("Dock");
    expect(state.result).toBeNull();
  });
});
