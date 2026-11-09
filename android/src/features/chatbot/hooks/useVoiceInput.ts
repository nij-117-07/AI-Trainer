// src/features/chatbot/hooks/useVoiceInput.ts
/**
 * Voice input for the composer: record, then send the recording to the voice model in AI settings.
 * The transcript goes to onTranscript so the user can read and edit it before sending.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { isVoiceConfigured, resolveVoiceConnection } from "@/features/ai-settings/lib/voice";
import { readRecording } from "@/features/speech-input/lib/audio";
import { transcribeAudio } from "@/features/speech-input/lib/transcribe";
import type { AiSettings } from "@/features/ai-settings/types";

function messageOf(cause: unknown, fallback: string): string {
  return cause instanceof Error ? cause.message : fallback;
}

export function useVoiceInput(onTranscript: (text: string) => void) {
  const { settings } = useAiSettings();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 500);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const transcriptRef = useRef(onTranscript);
  const settingsRef = useRef<AiSettings>(settings);
  const abortRef = useRef<AbortController | null>(null);

  transcriptRef.current = onTranscript;
  settingsRef.current = settings;

  const ready = isVoiceConfigured(resolveVoiceConnection(settings));
  const recording = recorderState.isRecording;

  useEffect(() => () => abortRef.current?.abort(), []);

  const start = useCallback(async () => {
    setError(null);
    if (!ready) {
      setError("Add the voice model in AI settings first.");
      return;
    }
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setError("Microphone access is needed for voice input. Allow it in your device settings.");
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (cause) {
      setError(messageOf(cause, "Could not start recording."));
    }
  }, [ready, recorder]);

  const stop = useCallback(async () => {
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
    } catch (cause) {
      setError(messageOf(cause, "Could not stop recording."));
      return;
    }
    const uri = recorder.uri;
    if (!uri) {
      setError("The recording was empty. Try again.");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setTranscribing(true);
    try {
      const connection = resolveVoiceConnection(settingsRef.current);
      const audio = await readRecording(uri);
      const text = await transcribeAudio({
        connection,
        audioBase64: audio.base64,
        format: audio.format,
        signal: controller.signal,
      });
      transcriptRef.current(text);
    } catch (cause) {
      if (!controller.signal.aborted) setError(messageOf(cause, "Transcription failed."));
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setTranscribing(false);
    }
  }, [recorder]);

  const toggle = useCallback(async () => {
    if (recording) await stop();
    else await start();
  }, [recording, start, stop]);

  return {
    ready,
    recording,
    transcribing,
    elapsedMs: recorderState.durationMillis,
    error,
    toggle,
  };
}
