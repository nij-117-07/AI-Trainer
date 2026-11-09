// src/features/chatbot/hooks/useReplySpeech.ts
/**
 * Reads a persona's reply aloud with the speech model and voice from AI settings. Each reply is
 * generated once per session and then replayed from memory.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { isSpeechConfigured, resolveSpeechConnection } from "@/features/ai-settings/lib/speech";
import { createPlayableClip, releaseClip } from "@/features/text-to-speech/lib/clip";
import { MAX_SPEECH_CHARS, synthesizeSpeech } from "@/features/text-to-speech/lib/synthesize";
import { makeId } from "../lib/ids";
import { openClipPlayer, type ClipPlayer } from "../lib/playback";

export interface ReplySpeech {
  ready: boolean;
  activeId: string | null;
  loadingId: string | null;
  error: string | null;
  speak: (id: string, text: string) => Promise<void>;
  stop: () => void;
}

export function useReplySpeech(): ReplySpeech {
  const { settings } = useAiSettings();
  const connection = resolveSpeechConnection(settings);
  const ready = isSpeechConfigured(connection);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const connectionRef = useRef(connection);
  const clipsRef = useRef(new Map<string, string>());
  const playerRef = useRef<ClipPlayer | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  connectionRef.current = connection;

  const stop = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    playerRef.current?.release();
    playerRef.current = null;
    setActiveId(null);
    setLoadingId(null);
  }, []);

  useEffect(() => {
    const clips = clipsRef.current;
    return () => {
      stop();
      clips.forEach((uri) => releaseClip(uri));
      clips.clear();
    };
  }, [stop]);

  const startPlayback = useCallback((id: string, uri: string) => {
    playerRef.current?.release();
    playerRef.current = openClipPlayer(uri, {
      onFinish: () => setActiveId((current) => (current === id ? null : current)),
      onError: (message) => {
        setError(message);
        setActiveId(null);
      },
    });
    setLoadingId(null);
    playerRef.current.play();
  }, []);

  const speak = useCallback(
    async (id: string, text: string) => {
      stop();
      setError(null);
      const current = connectionRef.current;
      if (!isSpeechConfigured(current)) {
        setError("Add the speech model and voice in AI settings first.");
        return;
      }
      if (text.length > MAX_SPEECH_CHARS) {
        setError(`This reply is longer than ${MAX_SPEECH_CHARS} characters, so it cannot be read aloud.`);
        return;
      }
      setActiveId(id);

      const cached = clipsRef.current.get(id);
      if (cached) {
        startPlayback(id, cached);
        return;
      }

      const controller = new AbortController();
      controllerRef.current = controller;
      setLoadingId(id);
      try {
        const clip = await synthesizeSpeech({ connection: current, text, signal: controller.signal });
        const uri = await createPlayableClip(clip.bytes, clip.mimeType, makeId("speech"));
        if (controller.signal.aborted) {
          releaseClip(uri);
          return;
        }
        controllerRef.current = null;
        clipsRef.current.set(id, uri);
        startPlayback(id, uri);
      } catch (cause) {
        if (controller.signal.aborted) return;
        controllerRef.current = null;
        setError(cause instanceof Error ? cause.message : "Speech generation failed.");
        setActiveId(null);
        setLoadingId(null);
      }
    },
    [stop, startPlayback],
  );

  return { ready, activeId, loadingId, error, speak, stop };
}
