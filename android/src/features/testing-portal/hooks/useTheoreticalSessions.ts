// src/features/testing-portal/hooks/useTheoreticalSessions.ts
/** The saved theoretical sessions and the open one. The list reloads each time the page is focused. */
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { EMPTY_THEORETICAL_SESSIONS, type TheoreticalSessionIndex } from "../lib/persistence";
import {
  createTheoreticalSession,
  deleteTheoreticalSession,
  loadTheoreticalSessionIndex,
  setActiveTheoreticalSession,
} from "../lib/theoretical-sessions";

export function useTheoreticalSessions() {
  const [index, setIndex] = useState<TheoreticalSessionIndex>(EMPTY_THEORETICAL_SESSIONS);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    setIndex(await loadTheoreticalSessionIndex().catch(() => EMPTY_THEORETICAL_SESSIONS));
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh().finally(() => setLoaded(true));
    }, [refresh]),
  );

  const open = useCallback(
    async (sessionId: string) => {
      await setActiveTheoreticalSession(sessionId);
      await refresh();
    },
    [refresh],
  );

  const create = useCallback(async () => {
    const sessionId = await createTheoreticalSession();
    await refresh();
    return sessionId;
  }, [refresh]);

  const remove = useCallback(
    async (sessionId: string) => {
      await deleteTheoreticalSession(sessionId);
      await refresh();
    },
    [refresh],
  );

  return { loaded, sessions: index.sessions, activeId: index.activeId, open, create, remove };
}
