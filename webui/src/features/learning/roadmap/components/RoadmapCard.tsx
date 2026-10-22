// src/features/learning/roadmap/components/RoadmapCard.tsx
/**
 * Card for a single roadmap on the list page: subject, start→target levels,
 * progress, item counts, and open/delete actions.
 */
"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPinned, Trash2 } from "lucide-react";
import type { Roadmap } from "../types";
import { computeProgress } from "../lib/progress";
import { ProgressBar } from "./ProgressBar";

interface RoadmapCardProps {
  roadmap: Roadmap;
  onDelete: (roadmap: Roadmap) => void;
}

export function RoadmapCard({ roadmap, onDelete }: RoadmapCardProps) {
  const progress = computeProgress(roadmap);
  const subtopicCount = roadmap.main_topics.reduce(
    (sum, point) => sum + point.subtopics.length,
    0
  );

  return (
    <Card className="transition-all hover:-translate-y-0.5 hover:ring-primary/40">
      <CardContent className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/15 to-teal-500/15 text-emerald-500">
            <MapPinned className="h-5 w-5" />
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Delete roadmap"
            onClick={() => onDelete(roadmap)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1">
          <h3 className="font-semibold leading-snug">{roadmap.subject}</h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">{roadmap.start_level}</Badge>
            <span className="text-xs text-muted-foreground">→</span>
            <Badge variant="secondary">{roadmap.target_level}</Badge>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {roadmap.main_topics.length} main point
          {roadmap.main_topics.length === 1 ? "" : "s"} · {subtopicCount} subpoint
          {subtopicCount === 1 ? "" : "s"}
        </p>

        <ProgressBar
          done={progress.done}
          total={progress.total}
          percent={progress.percent}
          className="mt-auto"
        />

        <Link
          href={`/learning/roadmap/${roadmap.id}`}
          className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Open roadmap
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
