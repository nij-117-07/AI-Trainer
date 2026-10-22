// src/features/learning/explainer/components/results/CurriculumResult.tsx
/**
 * Renders the Curriculum Path output: rationale, the crux, the phased roadmap,
 * and the suggested focus for today's session.
 */
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { ResultCallout } from "../ResultCallout";
import { Compass, Lightbulb, Route, ScrollText } from "lucide-react";
import type { CurriculumResponse } from "../../types";

export function CurriculumResult({ result }: { result: CurriculumResponse }) {
  return (
    <div className="space-y-4">
      <ResultCallout icon={Lightbulb} title="The Crux" tone="success">
        <MarkdownContent content={result.the_crux} />
      </ResultCallout>

      <ResultCallout icon={ScrollText} title="Rationale" tone="info">
        <MarkdownContent content={result.rationale} />
      </ResultCallout>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-4 w-4 text-primary" />
            Learning Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          {result.learning_roadmap.length === 0 ? (
            <p className="text-sm text-muted-foreground">No roadmap phases returned.</p>
          ) : (
            <ol className="space-y-3">
              {result.learning_roadmap.map((phase, index) => (
                <li key={`${phase.phase}-${index}`} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold">{phase.phase}</p>
                    <p className="text-sm text-muted-foreground">{phase.description}</p>
                    <p className="text-xs text-primary/80">
                      Objective: {phase.learning_objective}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      <ResultCallout icon={Compass} title="Suggested Focus" tone="accent">
        <MarkdownContent content={result.suggested_focus} />
        {result.session_id && (
          <div className="mt-2">
            <Badge variant="outline">Session: {result.session_id}</Badge>
          </div>
        )}
      </ResultCallout>
    </div>
  );
}
