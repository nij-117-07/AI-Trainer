// src/features/common/ASR/index.ts
/**
 * Barrel exports for the shared ASR (Automatic Speech Recognition) feature.
 * Import from '@/features/common/ASR' for transcription needs.
 */

export { transcribeAudio } from './actions/transcribe';
export type { ASRResponse } from './types';
