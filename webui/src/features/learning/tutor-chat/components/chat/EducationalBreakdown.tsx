// src/features/learning/tutor-chat/components/chat/EducationalBreakdown.tsx
/**
 * Collapsible "concept breakdown" shown beneath a tutor reply. Lists the
 * title/description pairs the backend returned for the current turn.
 */
"use client";

import { ChevronDown } from "lucide-react";
import type { EducationalBreakdown as EducationalBreakdownItem } from "../../types";

interface EducationalBreakdownProps {
  items: EducationalBreakdownItem[];
}

export function EducationalBreakdown({ items }: EducationalBreakdownProps) {
  if (items.length === 0) return null;

  return (
    <details className="group mt-3 rounded-lg border border-border/70 bg-background/60">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground select-none">
        <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
        Concept breakdown
        <span className="text-muted-foreground/60">({items.length})</span>
      </summary>
      <div className="space-y-3 border-t px-3 py-3">
        {items.map((item, index) => (
          <div key={index}>
            <p className="text-sm font-semibold">{item.title}</p>
            {item.description.trim() && (
              <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    </details>
  );
}
