// src/features/linguistic/idioms/components/results/IdiomResult.tsx
/**
 * Renders the Idioms output as a composed Markdown document: the idiom itself
 * with pronunciation, its meaning and equivalent, cultural context, a dialogue
 * scenario, and a practice prompt.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { IdiomResponse } from "../../types";

interface IdiomResultProps {
  result: IdiomResponse;
  /** The user's native language, used to label the equivalence section. */
  nativeLanguage?: string;
}

export function IdiomResult({ result, nativeLanguage }: IdiomResultProps) {
  const sections: string[] = [];

  const header: string[] = [`# ${result.idiom_in_target_language}`];
  if (result.phonetic_pronunciation.trim()) {
    header.push(`*${result.phonetic_pronunciation.trim()}*`);
  }
  sections.push(header.join("\n\n"));

  const meaning: string[] = ["## What It Means"];
  if (result.figurative_meaning.trim()) {
    meaning.push(result.figurative_meaning.trim());
  }
  if (result.equivalent_in_native_language.trim()) {
    meaning.push(
      nativeLanguage
        ? `**Equivalent in ${nativeLanguage.trim()}:** ${result.equivalent_in_native_language.trim()}`
        : `**Equivalent in your language:** ${result.equivalent_in_native_language.trim()}`
    );
  }
  sections.push(meaning.join("\n\n"));

  if (result.cultural_context.trim()) {
    sections.push(`## Cultural Context\n\n${result.cultural_context.trim()}`);
  }
  if (result.dialogue_scenario.trim()) {
    sections.push(`## In a Real Conversation\n\n${result.dialogue_scenario.trim()}`);
  }
  if (result.practice_prompt.trim()) {
    sections.push(`## Try It Yourself\n\n${result.practice_prompt.trim()}`);
  }
  if (result.rationale.trim()) {
    sections.push(`## Why This Idiom\n\n${result.rationale.trim()}`);
  }

  return (
    <Card>
      <CardContent className="p-5">
        <MarkdownContent content={sections.join("\n\n---\n\n")} />
      </CardContent>
    </Card>
  );
}
