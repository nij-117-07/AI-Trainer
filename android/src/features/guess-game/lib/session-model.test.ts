import {
  guessesLeft,
  parseSavedSession,
  recordCoaching,
  recordGuess,
  recordHint,
  startSession,
} from "./session-model";

const setup = { mysteryItem: "Lighthouse", funFact: "Built in 1842.", firstHint: "Seven letters.", maxGuesses: 2 };

describe("startSession", () => {
  it("starts unsolved with the first hint in the log", () => {
    const session = startSession(setup, "word", "easy");
    expect(session.hints).toEqual(["Seven letters."]);
    expect(session.guesses).toEqual([]);
    expect(session.solved).toBe(false);
    expect(session.log[0].content).toContain("**First hint:** Seven letters.");
  });
});

describe("recordGuess", () => {
  it("marks the game solved and reveals the answer on a correct guess", () => {
    const next = recordGuess(startSession(setup, "word", "easy"), "lighthouse", {
      correct: true,
      feedback: "Spot on.",
      closeness: 1,
      suggestion: "",
    });
    expect(next.solved).toBe(true);
    expect(next.guesses).toEqual(["lighthouse"]);
    expect(next.log.slice(-2)[1].content).toContain("**Correct!** The answer was **Lighthouse**.");
  });

  it("keeps the game open and nudges on a wrong guess", () => {
    const next = recordGuess(startSession(setup, "word", "easy"), "castle", {
      correct: false,
      feedback: "Not quite.",
      closeness: 0.2,
      suggestion: "Think coastal.",
    });
    expect(next.solved).toBe(false);
    expect(next.log.slice(-1)[0].content).toBe("Not quite.\n\n*Nudge: Think coastal.*");
  });
});

describe("recordHint and recordCoaching", () => {
  it("numbers the new hint by the count of hints shown", () => {
    const next = recordHint(startSession(setup, "word", "easy"), { hint: "Coastal.", encouragement: "Keep going." });
    expect(next.hints).toEqual(["Seven letters.", "Coastal."]);
    expect(next.log.slice(-1)[0].content).toBe("**Hint 2:** Coastal.\n\nKeep going.");
  });

  it("adds the partial reveal only when one was given", () => {
    const base = startSession(setup, "word", "easy");
    const withReveal = recordCoaching(base, {
      coaching: "Stay calm.",
      framework: "Think of buildings.",
      partialReveal: "Starts with L.",
      shouldHint: false,
    });
    expect(withReveal.log.slice(-1)[0].content).toContain("**Partial reveal:** Starts with L.");
    const without = recordCoaching(base, { coaching: "Stay calm.", framework: "Think.", partialReveal: null, shouldHint: false });
    expect(without.log.slice(-1)[0].content).not.toContain("Partial reveal");
  });
});

describe("guessesLeft", () => {
  it("never goes below zero", () => {
    let session = startSession(setup, "word", "easy");
    const wrong = { correct: false, feedback: "", closeness: 0, suggestion: "" };
    session = recordGuess(session, "a", wrong);
    session = recordGuess(session, "b", wrong);
    session = recordGuess(session, "c", wrong);
    expect(guessesLeft(session)).toBe(0);
  });
});

describe("parseSavedSession", () => {
  it("accepts a well-formed saved game", () => {
    const session = startSession(setup, "movie", "hard");
    expect(parseSavedSession(JSON.parse(JSON.stringify(session)))).toEqual(session);
  });

  it("keeps a custom category typed by the user", () => {
    const session = startSession(setup, "Board games", "easy");
    expect(parseSavedSession(JSON.parse(JSON.stringify(session)))?.category).toBe("Board games");
  });

  it("rejects damaged or missing data", () => {
    expect(parseSavedSession(null)).toBeNull();
    expect(parseSavedSession({ ...startSession(setup, "word", "easy"), category: "   " })).toBeNull();
    expect(parseSavedSession({ ...startSession(setup, "word", "easy"), log: [{ role: "bot", content: "x" }] })).toBeNull();
  });
});
