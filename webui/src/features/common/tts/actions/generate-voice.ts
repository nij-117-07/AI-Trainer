// src/features/common/tts/actions/generate-voice.ts
/**
 * Shared Server Action for TTS (Text-to-Speech) voice generation.
 * Sends text payload to the TTS API and returns audio data as base64 string.
 * Reusable across any feature requiring voice generation.
 */
"use server";

import { z } from "zod";

const voiceSchema = z.object({
  input_text: z.string().min(1).max(5000),
  voice: z.enum(["Kore"]),
});

/**
 * Generates voice audio from text using the external TTS API.
 * 
 * @param input_text - The text to synthesize into speech
 * @param voice - The voice profile to use (default: "Kore")
 * @returns Base64 encoded audio data URL string (data:audio/wav;base64,...)
 * @throws Error if the API request fails or returns invalid data
 */
export async function generateVoice(
  input_text: string,
  voice: string = "Kore"
): Promise<string> {
  const validated = voiceSchema.parse({ input_text, voice });
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("API URL not configured. Check your environment variables.");
  }
  const apiUrl = `${baseUrl.replace(/\/$/, '')}/voice/generate`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input_text: validated.input_text,
        voice: validated.voice,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(`Voice generation failed (${response.status}): ${errorText}`);
    }

    // Convert blob to base64 for serialization across Server Action boundary
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    return `data:audio/wav;base64,${buffer.toString("base64")}`;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error("Invalid input: " + error.issues.map(e => e.message).join(", "));
    }
    throw error;
  }
}
