// src/features/learning/skill-architect/components/SkillTreeDetailPage.tsx
/**
 * Detail view for a saved skill tree: header with topic + stats and delete,
 * followed by the level-by-level breakdown rendered as boxes with collapsible
 * sections.
 */
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Trash2 } from "lucide-react";
import type { SkillArchitectTree } from "../types";
import { deleteTreeAction } from "../actions/trees";
import { SkillArchitectResult } from "./results/SkillArchitectResult";

interface SkillTreeDetailPageProps {
  initialTree: SkillArchitectTree;
}

export function SkillTreeDetailPage({ initialTree }: SkillTreeDetailPageProps) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, startDelete] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const levels = initialTree.response.skill_tree_levels ?? [];
  const rootSkillCount = levels.reduce(
    (total, level) => total + (level.root_skills?.length ?? 0),
    0
  );

  const handleDelete = () => {
    startDelete(async () => {
      try {
        await deleteTreeAction(initialTree.id);
        router.push("/learning/skill-architect");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete the skill tree.");
        setConfirmDelete(false);
      }
    });
  };

  return (
    <div className="space-y-5">
      <Link
        href="/learning/skill-architect"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to skill trees
      </Link>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">{initialTree.topic}</h1>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary">
                  {levels.length} level{levels.length === 1 ? "" : "s"}
                </Badge>
                <Badge variant="outline">
                  {rootSkillCount} root skill{rootSkillCount === 1 ? "" : "s"}
                </Badge>
                <Badge variant="outline">Updated {initialTree.updated_at.slice(0, 10)}</Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete skill tree
            </Button>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      <SkillArchitectResult result={initialTree.response} />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this skill tree?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{initialTree.topic}&rdquo; and its generated skill levels will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDelete}>
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
