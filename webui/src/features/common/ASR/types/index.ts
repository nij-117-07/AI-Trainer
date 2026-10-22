// src/features/common/ASR/types/index.ts
/**
 * Shared type definitions for Automatic Speech Recognition (ASR) feature.
 * Used by all features that consume transcription services.
 */

import { z } from 'zod';

export interface ASRResponse {
  text: string;
  language: string | null;
  model: string;
}

export const asrResponseSchema = z.object({
  text: z.string(),
  language: z.string().nullable(),
  model: z.string(),
});
