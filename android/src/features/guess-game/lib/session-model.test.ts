import {
  guessesLeft,
  parseSavedSession,
  recordCoaching,
  recordGuess,
  recordHint,
  startSession,
} from "./session-model";

const setup = { mysteryItem: "Lighthouse", funFact: "Built in 1842.", firstHint: "Seven letters.", maxGuesses: 2 };
const wrong = { correct: false, feedback: "Not quite.", closeness: 0.2, suggestion: "Think coastal." };
const right = { correct: true, feedback: "Spot on.", closeness: 1, suggestion: "" };

describe("startSession", () => {
  it("starts unsolved with the first hint and no attempts", () => {
    const session = startSession(setup, "word", "easy");
    expect(session.hints).toEqual([{ hint: "Seven letters.", encouragement: "" }]);
    expect(session.attempts).toEqual([]);
    expect(session.solved).toBe(false);
    expect(session.coaching).toBeNull();
  });
});

describe("recordGuess", () => {
  it("marks the game solved on a correct guess", () => {
    const next = recordGuess(startSession(setup, "word", "easy"), "lighthouse", right);
    expect(next.solved).toBe(true);
    expect(next.attempts).toEqual([{ guess: "lighthouse", result: right }]);
  });

  it("keeps the game open on a wrong guess", () => {
    const next = recordGuess(startSession(setup, "word", "easy"), "castle", wrong);
    expect(next.solved).toBe(false);
    expect(next.attempts).toEqual([{ guess: "castle", result: wrong }]);
  });
});

describe("recordHint and recordCoaching", () => {
  it("appends the new hint with its encouragement", () => {
    const next = recordHint(startSession(setup, "word", "easy"), { hint: "Coastal.", encouragement: "Keep going." });
    expect(next.hints).toEqual([
      { hint: "Seven letters.", encouragement: "" },
      { hint: "Coastal.", encouragement: "Keep going." },
    ]);
  });

  it("keeps the latest coaching result", () => {
    const coaching = { coaching: "Stay calm.", framework: "Think of buildings.", partialReveal: "Starts with L.", shouldHint: false };
    expect(recordCoaching(startSession(setup, "word", "easy"), coaching).coaching).toEqual(coaching);
  });
});

describe("guessesLeft", () => {
  it("never goes below zero", () => {
    let session = startSession(setup, "word", "easy");
    session = recordGuess(session, "a", wrong);
    session = recordGuess(session, "b", wrong);
    session = recordGuess(session, "c", wrong);
    expect(guessesLeft(session)).toBe(0);
  });
});

describe("parseSavedSession", () => {
  it("accepts a well-formed saved game", () => {
    let session = startSession(setup, "movie", "hard");
    session = recordGuess(session, "Jaws", wrong);
    session = recordHint(session, { hint: "Water.", encouragement: "Good." });
    session = recordCoaching(session, { coaching: "Calm.", framework: "Genres.", partialReveal: null, shouldHint: true });
    expect(parseSavedSession(JSON.parse(JSON.stringify(session)))).toEqual(session);
  });

  it("keeps a custom category typed by the user", () => {
    const session = startSession(setup, "Board games", "easy");
    expect(parseSavedSession(JSON.parse(JSON.stringify(session)))?.category).toBe("Board games");
  });

  it("rejects damaged or missing data", () => {
    const base = startSession(setup, "word", "easy");
    expect(parseSavedSession(null)).toBeNull();
    expect(parseSavedSession({ ...base, category: "   " })).toBeNull();
    expect(parseSavedSession({ ...base, attempts: [{ guess: "x" }] })).toBeNull();
    expect(parseSavedSession({ ...base, hints: [{ hint: 3, encouragement: "" }] })).toBeNull();
  });
});
