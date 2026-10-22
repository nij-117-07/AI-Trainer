// src/features/learning/tutor/components/results/TutorResult.tsx
/**
 * Renders the Adaptive Tutor output as a composed Markdown document: the
 * adapted explanation, the concept analogy, and the follow-up feedback question.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { TutorResponse } from "../../types";

export function TutorResult({ result }: { result: TutorResponse }) {
  const sections: string[] = [];
  if (result.adapted_explanation.trim()) {
    sections.push(`## Adapted Explanation\n\n${result.adapted_explanation.trim()}`);
  }
  if (result.concept_analogy.trim()) {
    sections.push(`## Concept Analogy\n\n${result.concept_analogy.trim()}`);
  }
  if (result.tutor_feedback.trim()) {
    sections.push(
      `## Your Turn\n\n> ${result.tutor_feedback.trim().replace(/\n/g, "\n> ")}`
    );
  }

  return (
    <Card>
      <CardContent className="p-5">
        <MarkdownContent content={sections.join("\n\n---\n\n")} />
      </CardContent>
    </Card>
  );
}
