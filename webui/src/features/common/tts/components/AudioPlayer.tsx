// src/features/common/tts/components/AudioPlayer.tsx
/**
 * Audio player component for TTS voice playback.
 * Provides native HTML5 audio controls with custom styling and reset functionality.
 * Automatically attempts playback when audio source becomes available.
 */
"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface AudioPlayerProps {
  /** Base64 encoded audio source URL */
  src: string;
  /** Callback to clear the current audio and return to form */
  onReset: () => void;
}

/**
 * Displays an audio player with the generated voice.
 * Includes auto-play attempt and option to generate new audio.
 * 
 * @param src - Base64 encoded audio source URL (data:audio/wav;base64,...)
 * @param onReset - Callback to clear the current audio and return to form
 */
export function AudioPlayer({ src, onReset }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current && src) {
      // Attempt auto-play for better UX
      audioRef.current.play().catch(() => {
        // Auto-play blocked by browser policy, user can manually click play
      });
    }
  }, [src]);

  return (
    <div className="w-full space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Generated Voice
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="gap-2 shrink-0"
        >
          <RotateCcw className="h-4 w-4" />
          Generate New
        </Button>
      </div>
      
      <div className="relative overflow-hidden rounded-md bg-slate-50 p-4 border border-slate-100">
        <audio
          ref={audioRef}
          src={src}
          controls
          className="w-full"
          aria-label="Generated voice audio player"
        >
          Your browser does not support the audio element.
        </audio>
      </div>
      
      <p className="text-sm text-slate-500">
        Audio ready to play. Use controls above to listen or download the WAV file.
      </p>
    </div>
  );
}
