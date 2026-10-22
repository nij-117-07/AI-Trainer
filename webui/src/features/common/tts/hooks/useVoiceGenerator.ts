// src/features/common/tts/hooks/useVoiceGenerator.ts
/**
 * Custom hook managing voice generation state and audio playback preparation.
 * Handles the transition states between idle, generating, and ready-to-play.
 */
"use client";

import { useState, useTransition, useCallback } from "react";
import { generateVoice } from "@/features/common/tts/actions/generate-voice";

interface UseVoiceGeneratorReturn {
  /** Base64 data URL of the generated audio, null if not yet generated */
  audioSrc: string | null;
  /** True while Server Action is processing */
  isPending: boolean;
  /** Error message if generation failed, null otherwise */
  error: string | null;
  /** Initiates voice generation with the provided text and voice */
  generateAudio: (text: string, voice: string) => void;
  /** Resets the audio source and error state to initial values */
  clearAudio: () => void;
}

/**
 * Manages the voice generation workflow including loading states and error handling.
 * Uses React's useTransition for automatic loading state management.
 * 
 * @returns Object containing audio source, loading state, error state, and control functions
 */
export function useVoiceGenerator(): UseVoiceGeneratorReturn {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const generateAudio = useCallback((text: string, voice: string) => {
    setError(null);
    
    startTransition(async () => {
      try {
        const base64Audio = await generateVoice(text, voice);
        setAudioSrc(base64Audio);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate voice. Please try again.");
        setAudioSrc(null);
      }
    });
  }, []);

  const clearAudio = useCallback(() => {
    setAudioSrc(null);
    setError(null);
  }, []);

  return {
    audioSrc,
    isPending,
    error,
    generateAudio,
    clearAudio,
  };
}
