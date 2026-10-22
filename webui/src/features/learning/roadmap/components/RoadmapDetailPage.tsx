// src/features/learning/roadmap/components/RoadmapDetailPage.tsx
/**
 * Roadmap detail view. Holds the roadmap in local state, applies optimistic
 * updates for every edit (toggle/add/rename/delete), and persists each change
 * through saveRoadmapAction. Expanding a main point can AI-generate its
 * subpoints via expandTopicAction.
 */
"use client";

import { useMemo, useState, useTransition } from "react";
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
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { MapPinned, ScrollText, Trash2 } from "lucide-react";
import type { Roadmap } from "../types";
import { deleteRoadmapAction, saveRoadmapAction } from "../actions/crud";
import { expandTopicAction } from "../actions/expand";
import { computeProgress } from "../lib/progress";
import { ProgressBar } from "./ProgressBar";
import { AddPointForm } from "./AddPointForm";
import { MainPointItem } from "./MainPointItem";

interface RoadmapDetailPageProps {
  initialRoadmap: Roadmap;
}

export function RoadmapDetailPage({ initialRoadmap }: RoadmapDetailPageProps) {
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<Roadmap>(initialRoadmap);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSave] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  const progress = useMemo(() => computeProgress(roadmap), [roadmap]);

  const persist = (updater: (current: Roadmap) => Roadmap) => {
    const previous = roadmap;
    const next = updater(previous);
    next.updatedAt = new Date().toISOString();
    setRoadmap(next);
    setError(null);
    startSave(async () => {
      try {
        await saveRoadmapAction(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save changes.");
        setRoadmap(previous);
      }
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const generateSubtopics = async (pointId: string) => {
    setError(null);
    setGeneratingId(pointId);
    try {
      const updatedPoint = await expandTopicAction(roadmap.id, pointId);
      setRoadmap((current) => ({
        ...current,
        main_topics: current.main_topics.map((point) =>
          point.id === pointId ? updatedPoint : point
        ),
      }));
      setExpandedIds((current) => new Set(current).add(pointId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate subpoints.");
    } finally {
      setGeneratingId(null);
    }
  };

  const toggleMainDone = (id: string) =>
    persist((current) => ({
      ...current,
      main_topics: current.main_topics.map((point) =>
        point.id === id ? { ...point, done: !point.done } : point
      ),
    }));

  const renameMainPoint = (id: string, title: string) =>
    persist((current) => ({
      ...current,
      main_topics: current.main_topics.map((point) =>
        point.id === id ? { ...point, title } : point
      ),
    }));

  const deleteMainPoint = (id: string) =>
    persist((current) => ({
      ...current,
      main_topics: current.main_topics.filter((point) => point.id !== id),
    }));

  const addMainPoint = (title: string) =>
    persist((current) => ({
      ...current,
      main_topics: [
        ...current.main_topics,
        { id: crypto.randomUUID(), title, done: false, subtopics: [] },
      ],
    }));

  const toggleSubtopic = (pointId: string, subtopicId: string) =>
    persist((current) => ({
      ...current,
      main_topics: current.main_topics.map((point) =>
        point.id === pointId
          ? {
              ...point,
              subtopics: point.subtopics.map((subtopic) =>
                subtopic.id === subtopicId
                  ? { ...subtopic, done: !subtopic.done }
                  : subtopic
              ),
            }
          : point
      ),
    }));

  const addSubtopic = (pointId: string, title: string) =>
    persist((current) => ({
      ...current,
      main_topics: current.main_topics.map((point) =>
        point.id === pointId
          ? {
              ...point,
              subtopics: [
                ...point.subtopics,
                { id: crypto.randomUUID(), title, done: false },
              ],
            }
          : point
      ),
    }));

  const renameSubtopic = (pointId: string, subtopicId: string, title: string) =>
    persist((current) => ({
      ...current,
      main_topics: current.main_topics.map((point) =>
        point.id === pointId
          ? {
              ...point,
              subtopics: point.subtopics.map((subtopic) =>
                subtopic.id === subtopicId ? { ...subtopic, title } : subtopic
              ),
            }
          : point
      ),
    }));

  const deleteSubtopic = (pointId: string, subtopicId: string) =>
    persist((current) => ({
      ...current,
      main_topics: current.main_topics.map((point) =>
        point.id === pointId
          ? {
              ...point,
              subtopics: point.subtopics.filter((subtopic) => subtopic.id !== subtopicId),
            }
          : point
      ),
    }));

  const handleDeleteRoadmap = () => {
    startDelete(async () => {
      try {
        await deleteRoadmapAction(roadmap.id);
        router.push("/learning/roadmap");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete the roadmap.");
        setConfirmDelete(false);
      }
    });
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">{roadmap.subject}</h1>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary">{roadmap.start_level}</Badge>
                <span className="text-xs text-muted-foreground">→</span>
                <Badge variant="secondary">{roadmap.target_level}</Badge>
                <Badge variant="outline">{roadmap.mode}</Badge>
                {roadmap.persona_style && (
                  <Badge variant="outline">{roadmap.persona_style}</Badge>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete roadmap
            </Button>
          </div>

          <ProgressBar done={progress.done} total={progress.total} percent={progress.percent} />

          {roadmap.user_instructions && (
            <p className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Instructions:</span>{" "}
              {roadmap.user_instructions}
            </p>
          )}

          {roadmap.persona && (
            <details className="group">
              <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                <ScrollText className="h-4 w-4" />
                AI persona prompt
              </summary>
              <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                {roadmap.persona}
              </pre>
            </details>
          )}

          <div className="flex items-center gap-3">
            {isSaving && <span className="text-xs text-muted-foreground">Saving…</span>}
            {error && (
              <span role="alert" className="text-sm text-destructive">
                {error}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <AddPointForm
        placeholder="Add a main point manually…"
        submitLabel="Add main point"
        disabled={isSaving}
        onSubmit={addMainPoint}
      />

      {roadmap.main_topics.length === 0 ? (
        <EmptyResult
          icon={MapPinned}
          title="No main points yet"
          description="Add a main point manually, or restart with AI-generated points from the create flow."
        />
      ) : (
        <ol className="space-y-3">
          {roadmap.main_topics.map((point, index) => (
            <li key={point.id}>
              <MainPointItem
                point={point}
                index={index}
                expanded={expandedIds.has(point.id)}
                generating={generatingId === point.id}
                disabled={isSaving}
                onToggleExpand={() => toggleExpand(point.id)}
                onToggleDone={() => toggleMainDone(point.id)}
                onRename={(title) => renameMainPoint(point.id, title)}
                onDelete={() => deleteMainPoint(point.id)}
                onGenerateSubtopics={() => generateSubtopics(point.id)}
                onToggleSubtopic={(subtopicId) => toggleSubtopic(point.id, subtopicId)}
                onAddSubtopic={(title) => addSubtopic(point.id, title)}
                onRenameSubtopic={(subtopicId, title) =>
                  renameSubtopic(point.id, subtopicId, title)
                }
                onDeleteSubtopic={(subtopicId) => deleteSubtopic(point.id, subtopicId)}
              />
            </li>
          ))}
        </ol>
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this roadmap?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{roadmap.subject}&rdquo; and all of its main points and subpoints
              will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDeleteRoadmap}>
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
