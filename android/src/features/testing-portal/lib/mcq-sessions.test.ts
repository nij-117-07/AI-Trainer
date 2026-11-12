// src/features/testing-portal/lib/mcq-sessions.test.ts
import { EMPTY_MCQ_RESULT, MCQ_LEGACY_KEYS, MCQ_STORAGE_KEYS, mcqSessionKeys } from "./persistence";
import {
  createMcqSession,
  deleteMcqSession,
  ensureActiveMcqSession,
  loadActiveMcqResult,
  loadMcqSessionIndex,
  saveMcqSessionResult,
  setActiveMcqSession,
} from "./mcq-sessions";

jest.mock("@/lib/document-store", () => {
  const store = new Map<string, unknown>();
  return {
    store,
    loadDocument: jest.fn(async (key: string, fallback: unknown) => (store.has(key) ? store.get(key) : fallback)),
    saveDocument: jest.fn(async (key: string, value: unknown) => {
      store.set(key, JSON.parse(JSON.stringify(value)));
    }),
    removeDocument: jest.fn(async (key: string) => {
      store.delete(key);
    }),
  };
});

const docs = jest.requireMock<{ store: Map<string, unknown> }>("@/lib/document-store").store;
const validOptions = { A: "one", B: "two", C: "three", D: "four" };
const question = (text: string) => ({ questionText: text, options: validOptions, correctAnswer: "A" as const });

beforeEach(() => {
  docs.clear();
  jest.clearAllMocks();
});

describe("MCQ sessions", () => {
  it("creates sessions newest first and opens the latest one", async () => {
    const first = await createMcqSession();
    const second = await createMcqSession();
    const index = await loadMcqSessionIndex();
    expect(index.sessions.map((session) => session.id)).toEqual([second, first]);
    expect(index.activeId).toBe(second);
  });

  it("keeps each session's questions separate and names it after the topic", async () => {
    const a = await createMcqSession();
    await saveMcqSessionResult(a, { ...EMPTY_MCQ_RESULT, questions: [question("Q-a")] }, "Networking");
    const b = await createMcqSession();
    await saveMcqSessionResult(b, { ...EMPTY_MCQ_RESULT, questions: [question("Q-b")] });

    expect(await loadActiveMcqResult()).toMatchObject({ questions: [question("Q-b")] });
    await setActiveMcqSession(a);
    expect(await loadActiveMcqResult()).toMatchObject({ questions: [question("Q-a")] });

    const index = await loadMcqSessionIndex();
    expect(index.sessions.find((session) => session.id === a)).toMatchObject({ title: "Networking", questionCount: 1 });
  });

  it("opens the next session when the open one is deleted", async () => {
    const first = await createMcqSession();
    const second = await createMcqSession();
    await deleteMcqSession(second);
    const index = await loadMcqSessionIndex();
    expect(index.activeId).toBe(first);
    expect(docs.has(mcqSessionKeys(second).result)).toBe(false);
    expect(docs.has(mcqSessionKeys(second).answers)).toBe(false);
  });

  it("creates a session only when none is open", async () => {
    const id = await ensureActiveMcqSession();
    expect(await ensureActiveMcqSession()).toBe(id);
    expect((await loadMcqSessionIndex()).sessions).toHaveLength(1);
  });

  it("moves MCQs saved before sessions into a first session", async () => {
    docs.set(MCQ_LEGACY_KEYS.result, { ...EMPTY_MCQ_RESULT, questions: [question("Old")] });
    docs.set(MCQ_LEGACY_KEYS.answers, { 0: { selected: "B", checked: true } });

    const index = await loadMcqSessionIndex();
    expect(index.sessions).toHaveLength(1);
    expect(await loadActiveMcqResult()).toMatchObject({ questions: [question("Old")] });
    expect(docs.get(mcqSessionKeys(index.activeId ?? "").answers)).toEqual({ 0: { selected: "B", checked: true } });
    expect(docs.has(MCQ_LEGACY_KEYS.result)).toBe(false);
    expect(docs.has(MCQ_STORAGE_KEYS.sessions)).toBe(true);
  });
});
