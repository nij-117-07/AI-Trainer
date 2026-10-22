// src/features/learning/skill-architect/components/SkillTreeListPage.tsx
/**
 * Client wrapper for the skill-tree library: header with create button, the
 * card grid, and the delete confirmation flow.
 */
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { Layers } from "lucide-react";
import type { SkillArchitectTreeSummary } from "../types";
import { deleteTreeAction } from "../actions/trees";
import { SkillTreeCard } from "./SkillTreeCard";

interface SkillTreeListPageProps {
  initialTrees: SkillArchitectTreeSummary[];
}

export function SkillTreeListPage({ initialTrees }: SkillTreeListPageProps) {
  const [trees, setTrees] = useState<SkillArchitectTreeSummary[]>(initialTrees);
  const [pendingDelete, setPendingDelete] = useState<SkillArchitectTreeSummary | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    startDelete(async () => {
      try {
        await deleteTreeAction(pendingDelete.id);
        setTrees((current) => current.filter((tree) => tree.id !== pendingDelete.id));
      } catch (error) {
        console.error("[SkillArchitect] Failed to delete:", error);
      } finally {
        setPendingDelete(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Skill Architect</h1>
          <p className="max-w-2xl text-muted-foreground">
            Deconstruct any domain into its root skills and a level-wise progression
            tree.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/learning/skill-architect/new">
            <span className="text-lg leading-none">+</span>
            Create new skill
          </Link>
        </Button>
      </header>

      {trees.length === 0 ? (
        <div className="space-y-4">
          <EmptyResult
            icon={Layers}
            title="No skill trees yet"
            description="Create your first skill tree for any topic to see the level-by-level breakdown."
          />
          <div className="flex justify-center">
            <Button asChild className="gap-2">
              <Link href="/learning/skill-architect/new">
                <span className="text-lg leading-none">+</span>
                Create your first skill tree
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {trees.map((tree) => (
            <SkillTreeCard key={tree.id} tree={tree} onDelete={setPendingDelete} />
          ))}
        </div>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this skill tree?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{pendingDelete?.topic}&rdquo; and its generated skill levels will
              be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleConfirmDelete}>
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
