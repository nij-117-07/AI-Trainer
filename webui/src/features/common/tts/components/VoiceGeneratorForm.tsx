// src/features/common/tts/components/VoiceGeneratorForm.tsx
/**
 * Shared TTS voice generation form component.
 * Provides text input, voice selection, and submission handling with loading states.
 * Orchestrates the generation process and conditionally renders the audio player.
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Mic } from "lucide-react";
import { useVoiceGenerator } from "@/features/common/tts/hooks/useVoiceGenerator";
import { AudioPlayer } from "./AudioPlayer";

const VOICES = [
  { value: "Kore", label: "Kore (Premium)" },
];

/**
 * Form component for voice generation.
 * Manages user input state and orchestrates the generation process via useVoiceGenerator.
 * Displays either the input form or the resulting audio player based on state.
 */
export function VoiceGeneratorForm() {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("Kore");
  const { audioSrc, isPending, error, generateAudio, clearAudio } = useVoiceGenerator();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim() || isPending) return;
    generateAudio(text, selectedVoice);
  };

  // Render audio player when generation is complete
  if (audioSrc) {
    return (
      <div className="w-full">
        <AudioPlayer src={audioSrc} onReset={clearAudio} />
      </div>
    );
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="w-full space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="voice-text" className="text-base font-semibold text-slate-900">
          Text to Speak
        </Label>
        <Textarea
          id="voice-text"
          placeholder="Hello! I am speaking using the Google Gemini TTS engine..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[150px] resize-none text-base leading-relaxed"
          disabled={isPending}
          maxLength={5000}
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>Enter up to 5000 characters</span>
          <span>{text.length} / 5000</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="voice-select" className="text-base font-semibold text-slate-900">
          Voice Profile
        </Label>
        <Select
          value={selectedVoice}
          onValueChange={setSelectedVoice}
          disabled={isPending}
        >
          <SelectTrigger id="voice-select" className="w-full sm:w-[280px]">
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent>
            {VOICES.map((voice) => (
              <SelectItem key={voice.value} value={voice.value}>
                {voice.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600 animate-in slide-in-from-top-2">
          <p className="font-medium">Generation Failed</p>
          <p>{error}</p>
        </div>
      )}

      <div className="pt-2">
        <Button
          type="submit"
          disabled={!text.trim() || isPending}
          size="lg"
          className="w-full sm:w-auto min-w-[200px] gap-2 transition-all hover:scale-105 active:scale-95"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Voice...
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              Generate Voice
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
