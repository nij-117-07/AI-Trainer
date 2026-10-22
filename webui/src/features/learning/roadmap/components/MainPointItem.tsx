// src/features/learning/roadmap/components/MainPointItem.tsx
/**
 * A main point row with expand/collapse. Expanding reveals the subtopics (and
 * the milestone when one exists), plus AI "Generate subpoints" and manual add.
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronDown,
  ChevronRight,
  Flag,
  Loader2,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoadmapMainPoint } from "../types";
import { SubtopicItem } from "./SubtopicItem";
import { AddPointForm } from "./AddPointForm";
import { InlineEditForm } from "./InlineEditForm";

interface MainPointItemProps {
  point: RoadmapMainPoint;
  index: number;
  expanded: boolean;
  generating: boolean;
  disabled?: boolean;
  onToggleExpand: () => void;
  onToggleDone: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
  onGenerateSubtopics: () => void;
  onToggleSubtopic: (subtopicId: string) => void;
  onAddSubtopic: (title: string) => void;
  onRenameSubtopic: (subtopicId: string, title: string) => void;
  onDeleteSubtopic: (subtopicId: string) => void;
}

export function MainPointItem({
  point,
  index,
  expanded,
  generating,
  disabled,
  onToggleExpand,
  onToggleDone,
  onRename,
  onDelete,
  onGenerateSubtopics,
  onToggleSubtopic,
  onAddSubtopic,
  onRenameSubtopic,
  onDeleteSubtopic,
}: MainPointItemProps) {
  const [editing, setEditing] = useState(false);

  return (
    <Card className={cn("overflow-hidden transition-colors", point.done && "bg-muted/30")}>
      <CardContent className="p-0">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={expanded ? "Collapse main point" : "Expand main point"}
            disabled={disabled}
            onClick={onToggleExpand}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          <Checkbox
            checked={point.done}
            disabled={disabled}
            onCheckedChange={onToggleDone}
            aria-label={`Mark "${point.title}" done`}
          />
          {editing ? (
            <InlineEditForm
              initialValue={point.title}
              onSave={(title) => {
                onRename(title);
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
              disabled={disabled}
            />
          ) : (
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              onClick={onToggleExpand}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <span
                className={cn(
                  "min-w-0 truncate font-medium",
                  point.done && "text-muted-foreground line-through"
                )}
              >
                {point.title}
              </span>
              {point.subtopics.length > 0 && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  {point.subtopics.length} sub
                  {point.subtopics.length === 1 ? "" : "s"}
                </span>
              )}
            </button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Rename main point"
            disabled={disabled}
            onClick={() => setEditing((value) => !value)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Delete main point"
            disabled={disabled}
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {expanded && (
          <div className="space-y-3 border-t border-border px-3 py-3">
            {point.milestone && (
              <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-foreground/85">
                <Flag className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <span className="font-semibold">Milestone:</span> {point.milestone}
                </div>
              </div>
            )}

            {point.subtopics.length > 0 && (
              <ul className="space-y-0.5">
                {point.subtopics.map((subtopic) => (
                  <SubtopicItem
                    key={subtopic.id}
                    subtopic={subtopic}
                    disabled={disabled}
                    onToggle={() => onToggleSubtopic(subtopic.id)}
                    onRename={(title) => onRenameSubtopic(subtopic.id, title)}
                    onDelete={() => onDeleteSubtopic(subtopic.id)}
                  />
                ))}
              </ul>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || generating}
                onClick={onGenerateSubtopics}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    {point.subtopics.length > 0 ? "Regenerate subpoints" : "Generate subpoints"}
                  </>
                )}
              </Button>
            </div>

            <AddPointForm
              placeholder="Add a subpoint manually…"
              submitLabel="Add subpoint"
              disabled={disabled}
              onSubmit={(title) => onAddSubtopic(title)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
