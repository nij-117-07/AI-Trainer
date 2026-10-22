// src/features/learning/explainer/components/results/OrchestrateResult.tsx
/**
 * Renders the Orchestrated Journey streaming output: a live chapter plan, a
 * chapter-by-chapter accordion, an analogy/jargon summary per chapter, and a
 * streaming/done/error status with stop + clear controls.
 */
"use client";

import { useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { Progress } from "@/components/ui/progress";
import { Check, CircleDot, Loader2, RotateCcw, Square, MapPin, Sparkles } from "lucide-react";
import type { OrchestratorChapter } from "../../types";
import type { OrchestrateStatus } from "../../hooks/useOrchestrateStream";

interface OrchestrateResultProps {
  status: OrchestrateStatus;
  titles: string[];
  prerequisites: string[];
  chapters: OrchestratorChapter[];
  error: string | null;
  onStop: () => void;
  onReset: () => void;
}

export function OrchestrateResult({
  status,
  titles,
  prerequisites,
  chapters,
  error,
  onStop,
  onReset,
}: OrchestrateResultProps) {
  const progress = useMemo(() => {
    if (titles.length === 0) return 0;
    return Math.min(100, Math.round((chapters.length / titles.length) * 100));
  }, [titles.length, chapters.length]);

  if (status === "error") {
    return (
      <Card className="border-destructive/40 bg-destructive/5">
        <CardContent className="flex flex-col items-start gap-3">
          <p className="font-medium text-destructive">Stream failed</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Start over
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === "idle" && chapters.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-medium">No journey yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Fill in a topic and press <span className="font-medium">Start Journey</span> to
            stream chapters live into this panel.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {status === "streaming" && (
        <Card className="border-primary/30">
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Generating journey…
              </p>
              <Button variant="outline" size="sm" onClick={onStop}>
                <Square className="mr-1.5 h-3.5 w-3.5" />
                Stop
              </Button>
            </div>
            {titles.length > 0 && (
              <>
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground">
                  {chapters.length} / {titles.length} chapters
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {status === "done" && (
        <Card className="border-emerald-500/30 bg-emerald-500/10">
          <CardContent className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
              <Check className="h-4 w-4" />
              Journey complete
            </p>
            <Button variant="outline" size="sm" onClick={onReset}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Clear results
            </Button>
          </CardContent>
        </Card>
      )}

      {prerequisites.length > 0 && (
        <Card size="sm">
          <CardContent className="flex flex-wrap items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Prerequisites:</span>
            {prerequisites.map((item) => (
              <Badge key={item} variant="secondary">
                {item}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {titles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleDot className="h-4 w-4 text-primary" />
              Chapter Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {titles.map((title, index) => {
                const isDone = chapters.some((chapter) => chapter.title === title);
                const isCurrent = status === "streaming" && chapters.length === index;
                return (
                  <li key={`${title}-${index}`} className="flex items-center gap-2 text-sm">
                    {isDone ? (
                      <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                    ) : (
                      <span className="flex size-4 shrink-0 items-center justify-center">
                        <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                      </span>
                    )}
                    <span className={isDone ? "text-muted-foreground line-through" : ""}>
                      {title}
                    </span>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      )}

      {chapters.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          {chapters.map((chapter) => (
            <AccordionItem key={chapter.index} value={`chapter-${chapter.index}`}>
              <AccordionTrigger className="text-base">
                <span className="flex items-center gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                    {chapter.index}
                  </span>
                  {chapter.title}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <MarkdownContent content={chapter.content} className="space-y-3" />
                {chapter.analogy && (
                  <p className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-foreground/85">
                    <span className="font-semibold">Analogy:</span> {chapter.analogy}
                  </p>
                )}
                {chapter.jargon.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {chapter.jargon.map((term) => (
                      <Badge key={term} variant="outline">
                        {term}
                      </Badge>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
