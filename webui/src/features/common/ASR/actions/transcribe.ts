// src/features/common/ASR/actions/transcribe.ts
/**
 * Shared Server Action for voice transcription.
 * Sends multipart/form-data to the Whisper API endpoint and returns structured text.
 * Reusable across any feature requiring ASR (voice-notes, theoretical-questions, etc.).
 */

'use server';

import { ASRResponse, asrResponseSchema } from '../types';

/**
 * Sends audio file to the transcription API and returns structured text.
 * @param formData - FormData containing the 'file' field with an audio blob or File
 * @returns Parsed transcription response object
 * @throws Error if transcription fails or validation errors occur
 */
export async function transcribeAudio(
  formData: FormData
): Promise<ASRResponse> {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const apiUrl = `${BASE_URL.replace(/\/$/, '')}/voice/transcribe`;

  if (!apiUrl) {
    throw new Error('Voice transcription API URL not configured');
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        accept: 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    const rawData = await response.json();
    return asrResponseSchema.parse(rawData);
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio');
  }
}
