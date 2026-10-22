// src/features/learning/skill-architect/components/SkillTreeCard.tsx
/**
 * Card for a single skill tree on the list page: topic, level/root-skill
 * counts, last-updated date, and open/delete actions.
 */
"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Layers, Trash2 } from "lucide-react";
import type { SkillArchitectTreeSummary } from "../types";

interface SkillTreeCardProps {
  tree: SkillArchitectTreeSummary;
  onDelete: (tree: SkillArchitectTreeSummary) => void;
}

export function SkillTreeCard({ tree, onDelete }: SkillTreeCardProps) {
  return (
    <Card className="transition-all hover:-translate-y-0.5 hover:ring-primary/40">
      <CardContent className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/15 to-teal-500/15 text-emerald-500">
            <Layers className="h-5 w-5" />
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Delete skill tree"
            onClick={() => onDelete(tree)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1">
          <h3 className="font-semibold leading-snug">{tree.topic}</h3>
          <p className="text-xs text-muted-foreground">
            {tree.level_count} level{tree.level_count === 1 ? "" : "s"} ·{" "}
            {tree.root_skill_count} root skill{tree.root_skill_count === 1 ? "" : "s"}
          </p>
        </div>

        <p className="mt-auto text-xs text-muted-foreground">
          Updated {tree.updated_at.slice(0, 10)}
        </p>

        <Link
          href={`/learning/skill-architect/${tree.id}`}
          className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Open skill tree
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
