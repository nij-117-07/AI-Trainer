// src/features/learning/conceptual-bridge/components/results/ConceptualBridgeResult.tsx
/**
 * Displays the conceptual bridge: structural analogy, bridging narrative,
 * insight question, and the transfer-learning score.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { Link2, BookOpen, HelpCircle, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BridgeResponse } from "../../types";

function Section({ icon: Icon, title, content }: { icon: typeof Link2; title: string; content: string }) {
  return (
    <div className="space-y-1.5">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h3>
      <MarkdownContent content={content} className="text-sm" />
    </div>
  );
}

export function ConceptualBridgeResult({ result }: { result: BridgeResponse }) {
  const score = result.cognitive_flexibility_score;
  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
          <Brain className="h-5 w-5 shrink-0 text-primary" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Cognitive flexibility</p>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-28 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(score / 5) * 100}%` }}
                />
              </div>
              <span className={cn("text-sm font-semibold tabular-nums")}>{score} / 5</span>
            </div>
          </div>
        </div>
        <Section icon={Link2} title="Structural Analogy" content={result.structural_analogy} />
        <Section icon={BookOpen} title="Bridging Narrative" content={result.bridging_narrative} />
        <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
          <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="font-medium">Think about this: {result.insight_question}</p>
        </div>
      </CardContent>
    </Card>
  );
}
