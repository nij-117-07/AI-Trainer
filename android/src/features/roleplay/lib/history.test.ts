import { NO_HISTORY_TEXT, formatHistory, trimHistory } from "./history";

describe("trimHistory", () => {
  it("keeps every message when they fit the budget", () => {
    const history = [
      { role: "user" as const, content: "Bonjour" },
      { role: "assistant" as const, content: "Oui ?" },
    ];
    expect(trimHistory(history, 100)).toEqual(history);
  });

  it("drops the oldest messages first and keeps order", () => {
    const history = [
      { role: "user" as const, content: "aaaa" },
      { role: "assistant" as const, content: "bbbb" },
      { role: "user" as const, content: "cc" },
    ];
    expect(trimHistory(history, 6)).toEqual([
      { role: "assistant", content: "bbbb" },
      { role: "user", content: "cc" },
    ]);
  });

  it("skips damaged entries instead of throwing", () => {
    const damaged = [null, { role: "system", content: "x" }, { role: "user" }, { role: "user", content: "ok" }];
    expect(trimHistory(damaged as never, 100)).toEqual([{ role: "user", content: "ok" }]);
  });

  it("returns an empty list when the saved value is not a list", () => {
    expect(trimHistory("oops" as never)).toEqual([]);
  });
});

describe("formatHistory", () => {
  it("writes one labelled line per turn", () => {
    expect(
      formatHistory([
        { role: "user", content: "Hi" },
        { role: "assistant", content: "Welcome." },
      ]),
    ).toBe("[User]: Hi\n[Assistant]: Welcome.");
  });

  it("uses the no-history text for an empty transcript", () => {
    expect(formatHistory([])).toBe(NO_HISTORY_TEXT);
  });
});
