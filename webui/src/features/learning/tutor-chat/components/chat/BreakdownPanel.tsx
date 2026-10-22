// src/features/learning/tutor-chat/components/chat/BreakdownPanel.tsx
/**
 * Right-hand concept breakdown panel. Shows the educational breakdown for the
 * currently selected assistant reply and provides prev/next arrows to browse
 * older breakdowns. Empty until the first tutor reply arrives.
 */
"use client";

import { BookOpenCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { EducationalBreakdown as BreakdownItem } from "../../types";
import { EducationalBreakdown } from "./EducationalBreakdown";

interface BreakdownPanelProps {
  items: BreakdownItem[];
  index: number;
  count: number;
  onNavigate: (index: number) => void;
}

export function BreakdownPanel({ items, index, count, onNavigate }: BreakdownPanelProps) {
  const hasHistory = count > 0;
  const isFirst = index <= 0;
  const isLast = index >= count - 1;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <BookOpenCheck className="h-4 w-4 text-primary" />
          Educational Breakdown
        </CardTitle>
        <Separator />
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasHistory ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <BookOpenCheck className="h-6 w-6 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Concept breakdowns for each tutor reply will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={isFirst}
                aria-label="Previous breakdown"
                onClick={() => onNavigate(index - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs tabular-nums text-muted-foreground">
                Reply {index + 1} of {count}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={isLast}
                aria-label="Next breakdown"
                onClick={() => onNavigate(index + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {items.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No concept breakdown for this reply.
              </p>
            ) : (
              <EducationalBreakdown items={items} />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
