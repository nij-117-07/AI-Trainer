// src/features/learning/explainer/components/results/SocraticResult.tsx
/**
 * Renders the Socratic Mentor output: the pedagogical goal plus a list of
 * discovery questions with their cognitive challenge and guiding hint.
 */
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { ResultCallout } from "../ResultCallout";
import { HelpCircle, Lightbulb, Target } from "lucide-react";
import type { SocraticResponse } from "../../types";

export function SocraticResult({ result }: { result: SocraticResponse }) {
  return (
    <div className="space-y-4">
      <ResultCallout icon={Target} title="Pedagogical Goal" tone="info">
        <MarkdownContent content={result.pedagogical_goal} />
        <div className="mt-2">
          <Badge variant="secondary">{result.question_category}</Badge>
        </div>
      </ResultCallout>

      <div className="space-y-3">
        {result.questions_for_discovery.map((question, index) => (
          <Card key={`${question.question_text}-${index}`}>
            <CardHeader>
              <CardTitle className="flex items-start gap-2 text-sm">
                <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {index + 1}. {question.question_text}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="flex items-center gap-2 text-muted-foreground">
                <Lightbulb className="h-3.5 w-3.5 shrink-0" />
                {question.cognitive_challenge}
              </p>
              <p className="rounded-md bg-muted/50 px-3 py-2 text-muted-foreground">
                Hint: {question.guiding_hint}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
