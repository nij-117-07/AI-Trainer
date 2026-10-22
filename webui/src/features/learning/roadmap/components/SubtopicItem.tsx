// src/features/learning/roadmap/components/SubtopicItem.tsx
/**
 * A single subpoint row: done checkbox, title, inline rename, and delete.
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoadmapSubtopic } from "../types";
import { InlineEditForm } from "./InlineEditForm";

interface SubtopicItemProps {
  subtopic: RoadmapSubtopic;
  disabled?: boolean;
  onToggle: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}

export function SubtopicItem({
  subtopic,
  disabled,
  onToggle,
  onRename,
  onDelete,
}: SubtopicItemProps) {
  const [editing, setEditing] = useState(false);

  return (
    <li className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/40">
      <Checkbox
        checked={subtopic.done}
        disabled={disabled}
        onCheckedChange={onToggle}
        aria-label={`Mark "${subtopic.title}" done`}
      />
      {editing ? (
        <InlineEditForm
          initialValue={subtopic.title}
          onSave={(title) => {
            onRename(title);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
          disabled={disabled}
        />
      ) : (
        <>
          <span
            className={cn(
              "min-w-0 flex-1 text-sm",
              subtopic.done && "text-muted-foreground line-through"
            )}
          >
            {subtopic.title}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Rename subtopic"
            disabled={disabled}
            onClick={() => setEditing(true)}
            className="opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Delete subtopic"
            disabled={disabled}
            onClick={onDelete}
            className="opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </>
      )}
    </li>
  );
}
