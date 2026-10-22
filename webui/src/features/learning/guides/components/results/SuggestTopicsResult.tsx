// src/features/learning/guides/components/results/SuggestTopicsResult.tsx
/**
 * Renders the topic recommendations as a composed Markdown document with each
 * recommended topic and the reasoning behind it.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { WhatToLearnResponse } from "../../types";

export function SuggestTopicsResult({ result }: { result: WhatToLearnResponse }) {
  if (result.recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground">No topic recommendations returned.</p>
        </CardContent>
      </Card>
    );
  }

  const recommendations = result.recommendations
    .map(
      (recommendation, index) =>
        `### ${index + 1}. ${recommendation.topic_name}\n\n${recommendation.reason}`
    )
    .join("\n\n");

  return (
    <Card>
      <CardContent className="p-5">
        <MarkdownContent content={`## Recommended Next Topics\n\n${recommendations}`} />
      </CardContent>
    </Card>
  );
}
