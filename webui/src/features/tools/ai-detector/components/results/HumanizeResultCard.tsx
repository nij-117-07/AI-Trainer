// src/features/tools/ai-detector/components/results/HumanizeResultCard.tsx
/**
 * Renders the humanize response: the rewritten text (with copy button), the
 * pass-as-human confidence meter, and the list of changes made. Children slot
 * holds the CTA advancing to the re-detect step.
 */
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { HumanizerResponse } from "../../types";
import { ScoreBar } from "./ScoreBar";

interface HumanizeResultCardProps {
  result: HumanizerResponse;
  children?: ReactNode;
}

export function HumanizeResultCard({ result, children }: HumanizeResultCardProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result.humanized_text);
      setCopied(true);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">Humanized text</h3>
          <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        <div className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-lg bg-muted/40 p-4 text-sm leading-relaxed">
          {result.humanized_text}
        </div>

        <ScoreBar
          value={result.confidence}
          label="Pass-as-human confidence"
          variant="confidence"
          caption="How confident the model is that this reads as human-written."
        />

        {result.changes_made.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <ListChecks className="h-3.5 w-3.5 text-emerald-500" />
              Changes made
            </h4>
            <ul className="space-y-1.5">
              {result.changes_made.map((change) => (
                <li
                  key={change}
                  className="flex gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm leading-relaxed"
                >
                  <span aria-hidden className="text-muted-foreground">•</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {children}
      </CardContent>
    </Card>
  );
}
