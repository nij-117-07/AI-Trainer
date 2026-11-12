// src/features/testing-portal/lib/theoretical-sessions.test.ts
import { loadDocument, removeDocument, saveDocument } from "@/lib/document-store";
import { EMPTY_THEORETICAL_RESULT, THEORETICAL_LEGACY_KEYS, THEORETICAL_STORAGE_KEYS, theoreticalSessionKeys } from "./persistence";
import {
  createTheoreticalSession,
  deleteTheoreticalSession,
  ensureActiveTheoreticalSession,
  loadActiveTheoreticalResult,
  loadTheoreticalSessionIndex,
  saveTheoreticalSessionResult,
  setActiveTheoreticalSession,
} from "./theoretical-sessions";

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
const item = (text: string) => ({ questionText: text, focusArea: "", evaluationCriteria: "" });

beforeEach(() => {
  docs.clear();
  jest.clearAllMocks();
});

describe("theoretical sessions", () => {
  it("creates sessions newest first and opens the latest one", async () => {
    const first = await createTheoreticalSession();
    const second = await createTheoreticalSession();
    const index = await loadTheoreticalSessionIndex();
    expect(index.sessions.map((session) => session.id)).toEqual([second, first]);
    expect(index.sessions.map((session) => session.title)).toEqual(["Session 2", "Session 1"]);
    expect(index.activeId).toBe(second);
  });

  it("keeps each session's questions separate", async () => {
    const a = await createTheoreticalSession();
    await saveTheoreticalSessionResult(a, { ...EMPTY_THEORETICAL_RESULT, questions: [item("Q-a")] }, "Microservices");
    const b = await createTheoreticalSession();
    await saveTheoreticalSessionResult(b, { ...EMPTY_THEORETICAL_RESULT, questions: [item("Q-b1"), item("Q-b2")] });

    expect(await loadActiveTheoreticalResult()).toMatchObject({ questions: [item("Q-b1"), item("Q-b2")] });
    await setActiveTheoreticalSession(a);
    expect(await loadActiveTheoreticalResult()).toMatchObject({ questions: [item("Q-a")] });

    const index = await loadTheoreticalSessionIndex();
    expect(index.sessions.find((session) => session.id === a)).toMatchObject({
      title: "Microservices",
      questionCount: 1,
    });
  });

  it("opens the next session when the open one is deleted", async () => {
    const first = await createTheoreticalSession();
    const second = await createTheoreticalSession();
    await deleteTheoreticalSession(second);
    const index = await loadTheoreticalSessionIndex();
    expect(index.sessions.map((session) => session.id)).toEqual([first]);
    expect(index.activeId).toBe(first);
    expect(docs.has(theoreticalSessionKeys(second).result)).toBe(false);
  });

  it("clears the open id when the last session is deleted", async () => {
    const only = await createTheoreticalSession();
    await deleteTheoreticalSession(only);
    expect(await loadTheoreticalSessionIndex()).toEqual({ activeId: null, sessions: [] });
  });

  it("creates a session only when none is open", async () => {
    const id = await ensureActiveTheoreticalSession();
    expect(await ensureActiveTheoreticalSession()).toBe(id);
    expect((await loadTheoreticalSessionIndex()).sessions).toHaveLength(1);
  });

  it("moves questions saved before sessions into a first session", async () => {
    const legacy = { ...EMPTY_THEORETICAL_RESULT, questions: [item("Old")], history: ["Old"] };
    docs.set(THEORETICAL_LEGACY_KEYS.result, legacy);
    docs.set(THEORETICAL_LEGACY_KEYS.answers, { 0: { answer: "my answer" } });

    const index = await loadTheoreticalSessionIndex();
    expect(index.sessions).toHaveLength(1);
    expect(index.activeId).toBe(index.sessions[0].id);
    expect(await loadActiveTheoreticalResult()).toMatchObject({ questions: [item("Old")], history: ["Old"] });
    expect(docs.has(THEORETICAL_LEGACY_KEYS.result)).toBe(false);
    expect(docs.has(THEORETICAL_LEGACY_KEYS.answers)).toBe(false);
  });

  it("does not create a session when there is nothing to migrate", async () => {
    expect(await loadTheoreticalSessionIndex()).toEqual({ activeId: null, sessions: [] });
    expect(saveDocument).not.toHaveBeenCalled();
  });

  it("writes only the index key for the session list", async () => {
    await createTheoreticalSession();
    expect(docs.has(THEORETICAL_STORAGE_KEYS.sessions)).toBe(true);
    expect(loadDocument).toHaveBeenCalled();
    expect(removeDocument).not.toHaveBeenCalled();
  });
});
