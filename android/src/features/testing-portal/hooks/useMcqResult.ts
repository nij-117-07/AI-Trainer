// src/features/testing-portal/hooks/useMcqResult.ts
/**
 * The saved questions of the open MCQ session. It reloads each time the page is focused, so
 * questions generated on the New MCQs page appear when the user comes back. Clearing removes the
 * questions and answers of this session only. Each selected option is saved as it is made, so the
 * quiz looks the same after the user leaves and returns.
 */
import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { saveDocument } from "@/lib/document-store";
import type { OptionKey } from "../types";
import {
  EMPTY_MCQ_RESULT,
  EMPTY_MCQ_SESSIONS,
  loadMcqAnswers,
  loadMcqResult,
  mcqSessionKeys,
  type McqAnswers,
  type McqResult,
} from "../lib/persistence";
import { loadMcqSessionIndex, saveMcqSessionResult } from "../lib/mcq-sessions";

export function useMcqResult() {
  const [title, setTitle] = useState("");
  const [result, setResult] = useState<McqResult>(EMPTY_MCQ_RESULT);
  const [answers, setAnswers] = useState<McqAnswers>({});
  const [loaded, setLoaded] = useState(false);
  const [quizKey, setQuizKey] = useState(0);
  const answersRef = useRef<McqAnswers>({});
  const sessionIdRef = useRef<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadMcqSessionIndex()
        .catch(() => EMPTY_MCQ_SESSIONS)
        .then(async (index) => {
          const session = index.sessions.find((item) => item.id === index.activeId) ?? null;
          const [next, savedAnswers] = session
            ? await Promise.all([loadMcqResult(session.id), loadMcqAnswers(session.id)])
            : [EMPTY_MCQ_RESULT, {}];
          if (!active) return;
          sessionIdRef.current = session?.id ?? null;
          answersRef.current = savedAnswers;
          setTitle(session?.title ?? "");
          setResult(next);
          setAnswers(savedAnswers);
        })
        .finally(() => {
          if (active) setLoaded(true);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  const saveAnswers = useCallback((next: McqAnswers) => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;
    answersRef.current = next;
    setAnswers(next);
    saveDocument(mcqSessionKeys(sessionId).answers, next).catch(() => undefined);
  }, []);

  const selectAnswer = useCallback(
    (index: number, selected: OptionKey) => {
      saveAnswers({ ...answersRef.current, [index]: { selected, checked: true } });
    },
    [saveAnswers],
  );

  const resetAnswers = useCallback(() => {
    saveAnswers({});
  }, [saveAnswers]);

  const clear = useCallback(() => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;
    setResult(EMPTY_MCQ_RESULT);
    setQuizKey((key) => key + 1);
    saveAnswers({});
    saveMcqSessionResult(sessionId, EMPTY_MCQ_RESULT).catch(() => undefined);
  }, [saveAnswers]);

  return { loaded, title, result, quizKey, clear, answers, selectAnswer, resetAnswers };
}
