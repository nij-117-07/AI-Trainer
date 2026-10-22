// src/features/linguistic/poet-engine/components/results/PoetEngineResult.tsx
/**
 * Renders the poetic concept explanation as a composed Markdown document:
 * etymology, original poetry with translation, philosophical reflection, and a
 * visual metaphor.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { ConceptResponse } from "../../types";

export function PoetEngineResult({ result }: { result: ConceptResponse }) {
  const sections: string[] = [];
  if (result.etymological_soul.trim()) {
    sections.push(`## Etymological Soul\n\n${result.etymological_soul.trim()}`);
  }
  if (result.original_poetry.trim()) {
    sections.push(`## Original Poetry\n\n> ${result.original_poetry.trim()}`);
  }
  if (result.soulful_translation.trim()) {
    sections.push(`## Soulful Translation\n\n${result.soulful_translation.trim()}`);
  }
  if (result.philosophical_reflection.trim()) {
    sections.push(`## Philosophical Reflection\n\n${result.philosophical_reflection.trim()}`);
  }
  if (result.visual_metaphor.trim()) {
    sections.push(`## Visual Metaphor\n\n${result.visual_metaphor.trim()}`);
  }

  return (
    <Card>
      <CardContent className="p-5">
        <MarkdownContent content={sections.join("\n\n---\n\n")} />
      </CardContent>
    </Card>
  );
}
