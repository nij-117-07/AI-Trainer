import { appendStoppedReply, readMessage } from "./stop";

describe("appendStoppedReply", () => {
  it("adds a stopped assistant reply after the user's message", () => {
    const history = [{ role: "user" as const, content: "Bonjour" }];
    expect(appendStoppedReply(history, "  Oui")).toEqual([
      { role: "user", content: "Bonjour" },
      { role: "assistant", content: "Oui", stopped: true },
    ]);
  });

  it("keeps a stopped reply with no text", () => {
    expect(appendStoppedReply([], "")).toEqual([{ role: "assistant", content: "", stopped: true }]);
  });
});

describe("readMessage", () => {
  it("defaults stopped to false for saved messages from before the flag", () => {
    expect(readMessage({ role: "assistant", content: "Oui" })).toEqual({
      role: "assistant",
      content: "Oui",
      stopped: false,
    });
  });

  it("keeps a stopped reply that has no text", () => {
    expect(readMessage({ role: "assistant", content: "", stopped: true })).toEqual({
      role: "assistant",
      content: "",
      stopped: true,
    });
  });

  it("drops empty messages that are not stopped replies", () => {
    expect(readMessage({ role: "user", content: "  " })).toBeNull();
    expect(readMessage({ role: "user", content: "", stopped: true })).toBeNull();
  });

  it("drops damaged entries", () => {
    expect(readMessage(null)).toBeNull();
    expect(readMessage({ role: "system", content: "x" })).toBeNull();
  });
});
