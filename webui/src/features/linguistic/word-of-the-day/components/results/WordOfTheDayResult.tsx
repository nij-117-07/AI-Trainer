// src/features/linguistic/word-of-the-day/components/results/WordOfTheDayResult.tsx
/**
 * Renders the Word of the Day output as a composed Markdown document: the word
 * with translation, pronunciation, morphology, definition, history, a usage
 * sentence, and a synonym web.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { WotdResponse } from "../../types";

function bulletList(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

export function WordOfTheDayResult({ result }: { result: WotdResponse }) {
  const header: string[] = [`# ${result.word}`];
  if (result.native_translation.trim()) {
    header.push(`*${result.native_translation.trim()}*`);
  }

  const sections: string[] = [header.join("\n\n")];
  if (result.phonetic_and_audio_guide.trim()) {
    sections.push(`## Phonetic Guide\n\n${result.phonetic_and_audio_guide.trim()}`);
  }
  if (result.morphology_breakdown.trim()) {
    sections.push(`## How the Word Is Built\n\n${result.morphology_breakdown.trim()}`);
  }
  if (result.primary_definition.trim()) {
    sections.push(`## Definition\n\n${result.primary_definition.trim()}`);
  }
  if (result.the_vibe_check.trim()) {
    sections.push(`## Vibe Check\n\n${result.the_vibe_check.trim()}`);
  }
  if (result.historical_evolution.trim()) {
    sections.push(`## A Short History\n\n${result.historical_evolution.trim()}`);
  }
  if (result.modern_usage_sentence.trim()) {
    sections.push(`## In a Sentence\n\n${result.modern_usage_sentence.trim()}`);
  }
  sections.push(
    result.synonym_web.length
      ? `## Synonym Web\n\n${bulletList(result.synonym_web)}`
      : "## Synonym Web\n\n_No synonyms returned._"
  );

  return (
    <Card>
      <CardContent className="p-5">
        <MarkdownContent content={sections.join("\n\n---\n\n")} />
      </CardContent>
    </Card>
  );
}
