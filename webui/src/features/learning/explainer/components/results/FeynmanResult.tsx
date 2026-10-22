// src/features/learning/explainer/components/results/FeynmanResult.tsx
/**
 * Renders the Feynman Explainer output: the simplified explanation, key
 * metaphors as badges, and a fun analogy callout.
 */
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { ResultCallout } from "../ResultCallout";
import { KeyRound, MessageCircleHeart, Puzzle } from "lucide-react";
import type { FeynmanResponse } from "../../types";

export function FeynmanResult({ result }: { result: FeynmanResponse }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Puzzle className="h-4 w-4 text-primary" />
            Simplified Explanation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MarkdownContent content={result.explanation} />
        </CardContent>
      </Card>

      {result.key_metaphors.length > 0 && (
        <Card size="sm">
          <CardContent className="flex flex-wrap items-center gap-2">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Key metaphors:</span>
            {result.key_metaphors.map((metaphor) => (
              <Badge key={metaphor} variant="secondary">
                {metaphor}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <ResultCallout icon={MessageCircleHeart} title="Fun Analogy" tone="accent">
        {result.fun_analogy}
      </ResultCallout>
    </div>
  );
}
