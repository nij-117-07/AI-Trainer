// src/features/testing-portal/hooks/useMcqSessions.ts
/** The saved MCQ sessions and the open one. The list reloads each time the page is focused. */
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { EMPTY_MCQ_SESSIONS, type McqSessionIndex } from "../lib/persistence";
import {
  createMcqSession,
  deleteMcqSession,
  loadMcqSessionIndex,
  setActiveMcqSession,
} from "../lib/mcq-sessions";

export function useMcqSessions() {
  const [index, setIndex] = useState<McqSessionIndex>(EMPTY_MCQ_SESSIONS);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    setIndex(await loadMcqSessionIndex().catch(() => EMPTY_MCQ_SESSIONS));
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh().finally(() => setLoaded(true));
    }, [refresh]),
  );

  const open = useCallback(
    async (sessionId: string) => {
      await setActiveMcqSession(sessionId);
      await refresh();
    },
    [refresh],
  );

  const create = useCallback(async () => {
    const sessionId = await createMcqSession();
    await refresh();
    return sessionId;
  }, [refresh]);

  const remove = useCallback(
    async (sessionId: string) => {
      await deleteMcqSession(sessionId);
      await refresh();
    },
    [refresh],
  );

  return { loaded, sessions: index.sessions, activeId: index.activeId, open, create, remove };
}
