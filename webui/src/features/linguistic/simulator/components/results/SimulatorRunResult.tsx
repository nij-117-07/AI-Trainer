// src/features/linguistic/simulator/components/results/SimulatorRunResult.tsx
/**
 * Renders the one-shot simulation output as a composed Markdown document: the
 * scene, the persona's inner thought, their chosen action, their spoken
 * response, and their emotional state.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { SimulationResponse } from "../../types";

export function SimulatorRunResult({ result }: { result: SimulationResponse }) {
  const sections: string[] = [];

  if (result.thought_process.trim()) {
    sections.push(`## Inner Thought\n\n${result.thought_process.trim()}`);
  }
  if (result.chosen_action.trim()) {
    sections.push(`## Chosen Action\n\n${result.chosen_action.trim()}`);
  }
  if (result.response_dialogue.trim()) {
    sections.push(`## The Persona Responds\n\n> ${result.response_dialogue.trim()}`);
  }
  if (result.emotional_state.trim()) {
    sections.push(`## Emotional State\n\n${result.emotional_state.trim()}`);
  }

  const footer = result.simulation_id
    ? `_Simulation ID: \`${result.simulation_id}\`_`
    : "";

  return (
    <Card>
      <CardContent className="p-5">
        <MarkdownContent content={sections.join("\n\n---\n\n")} />
        {footer && (
          <p className="mt-6 border-t pt-4 text-xs text-muted-foreground">{footer}</p>
        )}
      </CardContent>
    </Card>
  );
}
