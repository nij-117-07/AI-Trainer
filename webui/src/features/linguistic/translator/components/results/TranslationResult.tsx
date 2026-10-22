// src/features/linguistic/translator/components/results/TranslationResult.tsx
/**
 * Renders the Translator output as a composed Markdown document: the translated
 * text, cultural notes, and the rationale behind the rendering.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { TranslationResponse } from "../../types";

export function TranslationResult({ result }: { result: TranslationResponse }) {
  const sections: string[] = [
    result.translated_text.trim()
      ? `## Translation\n\n> ${result.translated_text.trim().replace(/\n/g, "\n> ")}`
      : "## Translation\n\n_No translation returned._",
  ];
  if (result.cultural_notes.trim()) {
    sections.push(`## Cultural Notes\n\n${result.cultural_notes.trim()}`);
  }
  if (result.rationale.trim()) {
    sections.push(`## Why This Translation\n\n${result.rationale.trim()}`);
  }

  return (
    <Card>
      <CardContent className="p-5">
        <MarkdownContent content={sections.join("\n\n---\n\n")} />
      </CardContent>
    </Card>
  );
}
