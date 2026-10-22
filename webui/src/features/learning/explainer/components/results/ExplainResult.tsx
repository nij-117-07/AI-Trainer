// src/features/learning/explainer/components/results/ExplainResult.tsx
/**
 * Renders the output of the Quick Explain tool: a key takeaway callout
 * followed by the full explanation rendered as markdown.
 */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { ResultCallout } from "../ResultCallout";
import { Lightbulb, MessageSquareText } from "lucide-react";
import type { ExplainResponse } from "../../types";

export function ExplainResult({ result }: { result: ExplainResponse }) {
  return (
    <div className="space-y-4">
      <ResultCallout icon={Lightbulb} title="Key Takeaway" tone="success">
        {result.key_takeaway}
      </ResultCallout>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-primary" />
            Explanation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MarkdownContent content={result.explanation} />
        </CardContent>
      </Card>
    </div>
  );
}
