// src/features/message-refiner/options.ts
/** Tone presets for the Message Refiner. */
import type { MessageTone } from "./types";

export const toneOptions: { value: MessageTone; label: string }[] = [
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
  { value: "concise", label: "Concise" },
  { value: "persuasive", label: "Persuasive" },
  { value: "empathetic", label: "Empathetic" },
  { value: "apologetic", label: "Apologetic" },
  { value: "assertive", label: "Assertive" },
];
