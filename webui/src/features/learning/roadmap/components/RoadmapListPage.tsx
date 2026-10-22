// src/features/learning/roadmap/components/RoadmapListPage.tsx
/**
 * Client wrapper for the roadmap list: header with create button, the card
 * grid, and the delete confirmation flow.
 */
"use client";

import { useState, useTransition } from "react";
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
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { MapPinned } from "lucide-react";
import type { Roadmap } from "../types";
import { deleteRoadmapAction } from "../actions/crud";
import { RoadmapCard } from "./RoadmapCard";
import { CreateRoadmapForm } from "./CreateRoadmapForm";

interface RoadmapListPageProps {
  initialRoadmaps: Roadmap[];
}

export function RoadmapListPage({ initialRoadmaps }: RoadmapListPageProps) {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>(initialRoadmaps);
  const [pendingDelete, setPendingDelete] = useState<Roadmap | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    startDelete(async () => {
      try {
        await deleteRoadmapAction(pendingDelete.id);
        setRoadmaps((current) => current.filter((roadmap) => roadmap.id !== pendingDelete.id));
      } catch (error) {
        console.error("[Roadmap] Failed to delete:", error);
      } finally {
        setPendingDelete(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Learning Roadmap</h1>
          <p className="max-w-2xl text-muted-foreground">
            Plan a subject from where you are to where you want to be, then track
            your progress point by point.
          </p>
        </div>
        <CreateRoadmapForm />
      </header>

      {roadmaps.length === 0 ? (
        <EmptyResult
          icon={MapPinned}
          title="No roadmaps yet"
          description="Create your first learning roadmap and start planning a subject."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {roadmaps.map((roadmap) => (
            <RoadmapCard key={roadmap.id} roadmap={roadmap} onDelete={setPendingDelete} />
          ))}
        </div>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this roadmap?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{pendingDelete?.subject}&rdquo; and all of its main points and
              subpoints will be permanently removed.
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
