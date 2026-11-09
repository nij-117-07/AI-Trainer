// src/features/chatbot/hooks/useChatbot.ts
/**
 * Chat state for the chatbot screen: the active persona, its chats, the open chat, and replies.
 * Each turn is saved before the reply starts, so a closed app keeps the question.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { requestReply } from "../lib/completion";
import { loadMessages, loadThreads, removeMessages, saveMessages, saveThreads } from "../lib/chat-store";
import { buildRequestMessages } from "../lib/request";
import { createMessage, createThread, sortThreads, threadsForPersona, titleFrom } from "../lib/thread-model";
import type { ChatMessage, ChatThread, Persona } from "../types";
import { useChatbotConfig } from "./useChatbotConfig";

export function resolveModel(persona: Persona, chatModel: string): string {
  return persona.model.trim() || chatModel.trim();
}

function readinessProblem(persona: Persona, apiKey: string, chatModel: string): string | null {
  if (!apiKey.trim()) return "Add the chat API key in AI settings first.";
  if (!resolveModel(persona, chatModel)) return "Set a model on this persona, or a chat model in AI settings.";
  return null;
}

export function useChatbot() {
  const { settings: aiSettings } = useAiSettings();
  const config = useChatbotConfig();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [threadsLoaded, setThreadsLoaded] = useState(false);
  const [activePersonaId, setActivePersonaId] = useState<string | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessagesState] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastReplyId, setLastReplyId] = useState<string | null>(null);
  const threadsRef = useRef<ChatThread[]>([]);
  const messagesRef = useRef<ChatMessage[]>([]);
  const busyRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const setMessages = useCallback((next: ChatMessage[]) => {
    messagesRef.current = next;
    setMessagesState(next);
  }, []);

  const commitThreads = useCallback(async (next: ChatThread[]) => {
    const sorted = sortThreads(next);
    threadsRef.current = sorted;
    setThreads(sorted);
    await saveThreads(sorted);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      loadThreads()
        .then((list) => {
          if (cancelled || busyRef.current) return;
          const sorted = sortThreads(list);
          threadsRef.current = sorted;
          setThreads(sorted);
        })
        .catch(() => {
          if (!cancelled) setError("Saved chats could not be read.");
        })
        .finally(() => {
          if (!cancelled) setThreadsLoaded(true);
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  useEffect(() => () => abortRef.current?.abort(), []);

  const defaultPersonaId = config.personas.some((p) => p.id === config.settings.defaultPersonaId)
    ? config.settings.defaultPersonaId
    : (config.personas[0]?.id ?? null);
  const personaId = config.personas.some((p) => p.id === activePersonaId) ? activePersonaId : defaultPersonaId;
  const activePersona = config.personas.find((p) => p.id === personaId) ?? null;
  const personaThreads = useMemo(
    () => (activePersona ? threadsForPersona(threads, activePersona.id) : []),
    [threads, activePersona],
  );
  const activeThread = threads.find((t) => t.id === activeThreadId) ?? null;

  useEffect(() => {
    if (!threadsLoaded || busyRef.current || !activeThreadId) return;
    if (threads.some((t) => t.id === activeThreadId)) return;
    setActiveThreadId(null);
    setMessages([]);
  }, [threads, threadsLoaded, activeThreadId, setMessages]);

  const startNewChat = useCallback(() => {
    if (busyRef.current) return;
    setActiveThreadId(null);
    setMessages([]);
    setError(null);
  }, [setMessages]);

  const selectPersona = useCallback(
    (id: string) => {
      if (busyRef.current) return;
      setActivePersonaId(id);
      setActiveThreadId(null);
      setMessages([]);
      setError(null);
    },
    [setMessages],
  );

  const openThread = useCallback(
    async (id: string) => {
      if (busyRef.current) return;
      setError(null);
      try {
        const list = await loadMessages(id);
        setActiveThreadId(id);
        setMessages(list);
      } catch {
        setError("That chat could not be opened.");
      }
    },
    [setMessages],
  );

  const deleteThread = useCallback(
    async (id: string) => {
      if (busyRef.current) return;
      setError(null);
      try {
        await commitThreads(threadsRef.current.filter((t) => t.id !== id));
        await removeMessages(id);
        if (activeThreadId === id) {
          setActiveThreadId(null);
          setMessages([]);
        }
      } catch {
        setError("That chat could not be deleted.");
      }
    },
    [activeThreadId, commitThreads, setMessages],
  );

  const runTurn = useCallback(
    async (thread: ChatThread, history: ChatMessage[], persona: Persona) => {
      const assistant = createMessage("assistant", "", "streaming");
      const controller = new AbortController();
      busyRef.current = true;
      abortRef.current = controller;
      setSending(true);
      setError(null);
      setActiveThreadId(thread.id);
      setMessages([...history, assistant]);

      let reply = "";
      let failure: string | null = null;
      try {
        if (!threadsRef.current.some((t) => t.id === thread.id)) {
          await commitThreads([...threadsRef.current, thread]);
        }
        await saveMessages(thread.id, [...history, assistant]);
        const content = await requestReply({
          connection: {
            baseUrl: aiSettings.baseUrl,
            apiKey: aiSettings.apiKey.trim(),
            model: resolveModel(persona, aiSettings.modelName),
          },
          messages: buildRequestMessages(persona.systemPrompt, history, config.settings.historyLimit),
          params: { temperature: persona.temperature, topP: persona.topP, maxTokens: persona.maxTokens },
          stream: config.settings.streamReplies,
          signal: controller.signal,
          onDelta: (piece) => {
            reply += piece;
            setMessages(messagesRef.current.map((m) => (m.id === assistant.id ? { ...m, content: reply } : m)));
          },
        });
        reply = content;
      } catch (cause) {
        if (!controller.signal.aborted) {
          failure = cause instanceof Error ? cause.message : "The reply failed. Try again.";
        }
      }

      const outcome: Pick<ChatMessage, "status" | "content" | "error"> = failure
        ? { status: "error", content: reply, error: failure }
        : reply.trim()
          ? { status: "done", content: reply, error: null }
          : {
              status: "error",
              content: "",
              error: controller.signal.aborted ? "Stopped before a reply arrived." : "The model returned an empty reply.",
            };

      const finished = messagesRef.current.map((m) => (m.id === assistant.id ? { ...m, ...outcome } : m));
      abortRef.current = null;
      setMessages(finished);
      if (outcome.status === "done") setLastReplyId(assistant.id);
      try {
        const now = new Date().toISOString();
        const known = threadsRef.current.some((t) => t.id === thread.id);
        const next = known
          ? threadsRef.current.map((t) => (t.id === thread.id ? { ...t, updatedAt: now } : t))
          : [...threadsRef.current, { ...thread, updatedAt: now }];
        await saveMessages(thread.id, finished);
        await commitThreads(next);
      } catch {
        setError("This reply could not be saved on the device.");
      } finally {
        busyRef.current = false;
        setSending(false);
      }
    },
    [aiSettings, config.settings, commitThreads, setMessages],
  );

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || busyRef.current || !activePersona) return;
    const problem = readinessProblem(activePersona, aiSettings.apiKey, aiSettings.modelName);
    if (problem) {
      setError(problem);
      return;
    }
    setDraft("");
    const now = new Date().toISOString();
    const thread = activeThread ?? createThread(activePersona.id, titleFrom(text), now);
    await runTurn(thread, [...messagesRef.current, createMessage("user", text, "done", now)], activePersona);
  }, [draft, activePersona, activeThread, aiSettings.apiKey, aiSettings.modelName, runTurn]);

  const regenerate = useCallback(async () => {
    if (busyRef.current || !activeThread || !activePersona) return;
    const list = messagesRef.current;
    const last = list[list.length - 1];
    const history = list.slice(0, -1);
    const lastUser = history[history.length - 1];
    if (!last || last.role !== "assistant" || !lastUser || lastUser.role !== "user") return;
    const problem = readinessProblem(activePersona, aiSettings.apiKey, aiSettings.modelName);
    if (problem) {
      setError(problem);
      return;
    }
    await runTurn(activeThread, history, activePersona);
  }, [activeThread, activePersona, aiSettings.apiKey, aiSettings.modelName, runTurn]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    loaded: config.loaded && threadsLoaded,
    error: error ?? config.loadError,
    personas: config.personas,
    settings: config.settings,
    lastReplyId,
    activePersona,
    personaThreads,
    activeThreadId,
    messages,
    draft,
    setDraft,
    sending,
    selectPersona,
    startNewChat,
    openThread,
    deleteThread,
    send,
    regenerate,
    stop,
  };
}
