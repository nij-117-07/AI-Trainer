// src/features/practice/testing-portal/components/results/AnswerResult.tsx
/**
 * Renders a generated Subject Matter Expert answer with its key concepts.
 */
"use client";

import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { AnswerResponse } from "../../types";

export function AnswerResult({ result }: { result: AnswerResponse }) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Expert Answer</h2>
        </div>
        <MarkdownContent content={result.answer_text} />
        {result.key_concepts_covered.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Key concepts covered</h3>
            <div className="flex flex-wrap gap-2">
              {result.key_concepts_covered.map((concept) => (
                <span
                  key={concept}
                  className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
