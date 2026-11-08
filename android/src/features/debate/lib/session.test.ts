// src/features/debate/lib/session.test.ts
import { appendStatement, buildJudgeInput, buildTurnInput, createSession, historyText } from "./session";
import type { PersonaProfile } from "../types";

const PRO: PersonaProfile = {
  personaName: "Ada",
  systemPrompt: "Argue for UBI.",
  overallStance: "moderate",
  strategicPriorities: [],
  coreValues: [],
  linguisticQuirks: [],
};
const CON: PersonaProfile = { ...PRO, personaName: "Bram", systemPrompt: "Argue against UBI." };

describe("createSession and appendStatement", () => {
  it("opens with an intro line and empty transcripts", () => {
    const session = createSession("UBI", PRO, CON);
    expect(session.log).toHaveLength(1);
    expect(session.log[0]).toContain('**Ada** (for) and **Bram** (against) are ready on "UBI".');
    expect(session.proTranscript).toBe("");
    expect(session.complete).toBe(false);
  });

  it("adds a statement to the matching transcript and history", () => {
    const first = appendStatement(createSession("UBI", PRO, CON), "pro", "Everyone needs a floor.", null);
    const second = appendStatement(first, "con", "Cost is too high.", null);
    expect(second.proTranscript).toBe("Everyone needs a floor.\n\n");
    expect(second.conTranscript).toBe("Cost is too high.\n\n");
    expect(second.history).toEqual([
      { role: "user", content: "Everyone needs a floor." },
      { role: "user", content: "Cost is too high." },
    ]);
    expect(second.log[second.log.length - 1]).toBe("**CON (Bram)**: Cost is too high.");
  });
});

describe("historyText", () => {
  it("reads as a placeholder when there are no exchanges", () => {
    expect(historyText([])).toBe("No exchanges yet.");
    expect(historyText([{ role: "user", content: "Hi" }])).toBe("user: Hi");
  });
});

describe("buildTurnInput", () => {
  it("uses the chosen side's persona and the default instruction when no direction is typed", () => {
    const session = createSession("UBI", PRO, CON);
    const input = buildTurnInput(session, { side: "con", mode: "ai", text: "", strategy: "attack", evidence: " " });
    expect(input.systemPrompt).toBe("Argue against UBI.");
    expect(input.strategy).toBe("attack");
    expect(input.evidence).toBeUndefined();
    expect(input.instructions).toBe("Keep the spoken argument concise.");
  });

  it("rejects a persona without a system prompt", () => {
    const session = createSession("UBI", { ...PRO, systemPrompt: "" }, CON);
    expect(() => buildTurnInput(session, { side: "pro", mode: "ai", text: "", strategy: "defend", evidence: "" })).toThrow(
      "This persona has no system prompt. Edit or regenerate it first.",
    );
  });
});

describe("buildJudgeInput", () => {
  it("requires at least one statement before judging", () => {
    expect(() => buildJudgeInput(createSession("UBI", PRO, CON))).toThrow("Add at least one statement before judging.");
  });

  it("fills a missing transcript with a placeholder", () => {
    const session = appendStatement(createSession("UBI", PRO, CON), "pro", "Yes.", null);
    expect(buildJudgeInput(session)).toEqual({
      topic: "UBI",
      proTranscript: "Yes.",
      conTranscript: "No statements were made.",
    });
  });
});
