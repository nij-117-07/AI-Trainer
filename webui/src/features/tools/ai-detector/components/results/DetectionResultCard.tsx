// src/features/tools/ai-detector/components/results/DetectionResultCard.tsx
/**
 * Renders a detection response: AI-likelihood meter, verdict badge, reason,
 * flagged patterns, and suggested changes. Children slot holds the CTA button
 * that advances the wizard (rendered by the parent page).
 */
"use client";

import type { ReactNode } from "react";
import { AlertTriangle, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AIDetectionResponse } from "../../types";
import { ScoreBar } from "./ScoreBar";

function verdictClass(verdict: AIDetectionResponse["verdict"]): string {
  if (verdict === "Likely AI") return "border-destructive/40 bg-destructive/10 text-destructive";
  if (verdict === "Likely Human") return "border-emerald-500/40 bg-emerald-500/10 text-emerald-600";
  return "border-amber-500/40 bg-amber-500/10 text-amber-600";
}

function PatternList({
  title,
  icon,
  iconClass,
  items,
}: {
  title: string;
  icon: ReactNode;
  iconClass: string;
  items: string[];
}) {
  return (
    <div className="space-y-2">
      <h4 className={cn("flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground")}>
        <span className={iconClass}>{icon}</span>
        {title}
      </h4>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm leading-relaxed"
          >
            <span aria-hidden className="text-muted-foreground">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface DetectionResultCardProps {
  result: AIDetectionResponse;
  children?: ReactNode;
}

export function DetectionResultCard({ result, children }: DetectionResultCardProps) {
  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">Detection result</h3>
          <Badge variant="outline" className={verdictClass(result.verdict)}>
            {result.verdict}
          </Badge>
        </div>

        <ScoreBar value={result.ai_score} label="AI likelihood" variant="risk" />

        <p className="text-sm leading-relaxed text-foreground/85">{result.reason}</p>

        {result.flagged_patterns.length > 0 && (
          <PatternList
            title="Flagged patterns"
            icon={<AlertTriangle className="h-3.5 w-3.5" />}
            iconClass="text-amber-500"
            items={result.flagged_patterns}
          />
        )}

        {result.suggested_changes.length > 0 && (
          <PatternList
            title="Suggested changes"
            icon={<Lightbulb className="h-3.5 w-3.5" />}
            iconClass="text-sky-500"
            items={result.suggested_changes}
          />
        )}

        {children}
      </CardContent>
    </Card>
  );
}
