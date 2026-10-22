// src/features/learning/explainer/components/results/AtozResult.tsx
/**
 * Renders the A-to-Z Tutorial output as a single scrollable markdown document.
 */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { BookOpenText } from "lucide-react";
import type { TutorialResponse } from "../../types";

export function AtozResult({ result }: { result: TutorialResponse }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpenText className="h-4 w-4 text-primary" />
          Full A-to-Z Tutorial
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MarkdownContent content={result.full_explanation} />
      </CardContent>
    </Card>
  );
}
