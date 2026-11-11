// src/features/roadmap/hooks/useRoadmapDetail.ts
/**
 * State for one roadmap. Every edit updates the screen at once and saves in order. Expanding a main
 * point can generate its subpoints with AI and merges the result into the latest roadmap. A delete
 * is hidden at once and stays pending until the undo snackbar dismisses, a new delete replaces it,
 * or the screen unmounts.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { generateSubtopics } from "../lib/generators";
import {
  addMainPoint,
  applyExpansion,
  buildExpansionRequest,
  removeMainPoint,
  removeSubtopic,
  renameMainPoint,
  toggleMainPoint,
} from "../lib/roadmap-ops";
import { deleteRoadmap, getRoadmap, makeContext, saveRoadmap } from "../lib/roadmap-store";
import type { Roadmap } from "../types";

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export type PendingDelete =
  | { kind: "item"; message: string; apply: (roadmap: Roadmap) => Roadmap }
  | { kind: "roadmap"; message: string; onRemoved: () => void };

export function useRoadmapDetail(roadmapId: string) {
  const { settings } = useAiSettings();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingDelete | null>(null);
  const latest = useRef<Roadmap | null>(null);
  const pendingRef = useRef<PendingDelete | null>(null);

  useEffect(() => {
    let active = true;
    getRoadmap(roadmapId)
      .then((found) => {
        if (!active) return;
        latest.current = found;
        setRoadmap(found);
      })
      .catch((err: unknown) => {
        if (active) setError(messageOf(err, "Could not load this roadmap."));
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [roadmapId]);

  const commit = useCallback((change: (current: Roadmap) => Roadmap) => {
    const current = latest.current;
    if (!current) return;
    const next = change(current);
    if (next === current) return;
    latest.current = next;
    setRoadmap(next);
    setError(null);
    saveRoadmap(next).catch((err: unknown) => setError(messageOf(err, "Failed to save changes.")));
  }, []);

  const settle = useCallback(
    (leave: boolean) => {
      const item = pendingRef.current;
      if (!item) return;
      pendingRef.current = null;
      setPending(null);
      if (item.kind === "item") {
        commit(item.apply);
        return;
      }
      const current = latest.current;
      if (!current) return;
      deleteRoadmap(current.id).then(
        () => {
          if (leave) item.onRemoved();
        },
        (err: unknown) => setError(messageOf(err, "Failed to delete the roadmap.")),
      );
    },
    [commit],
  );

  useEffect(() => () => settle(false), [settle]);

  const queue = useCallback(
    (item: PendingDelete) => {
      settle(false);
      pendingRef.current = item;
      setPending(item);
    },
    [settle],
  );

  const undo = useCallback(() => {
    pendingRef.current = null;
    setPending(null);
  }, []);

  const dismiss = useCallback(() => settle(true), [settle]);

  function setExpanded(id: string, open: boolean) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function generateForPoint(pointId: string, instructions?: string) {
    const current = latest.current;
    if (!current) return;
    const request = buildExpansionRequest(current, pointId, instructions);
    if (!request) return;
    setError(null);
    setGeneratingId(pointId);
    try {
      const expansion = await generateSubtopics(settings, request);
      commit((item) => applyExpansion(item, pointId, expansion, makeContext()));
      setExpanded(pointId, true);
    } catch (err) {
      setError(messageOf(err, "Failed to generate subpoints."));
    } finally {
      setGeneratingId(null);
    }
  }

  function removeStage(pointId: string) {
    const point = latest.current?.mainPoints.find((item) => item.id === pointId);
    if (!point) return;
    const ctx = makeContext();
    queue({ kind: "item", message: `Deleted stage ${point.title}`, apply: (item) => removeMainPoint(item, pointId, ctx) });
  }

  function removeSubpoint(pointId: string, subtopicId: string) {
    const subtopic = latest.current?.mainPoints
      .find((point) => point.id === pointId)
      ?.subtopics.find((item) => item.id === subtopicId);
    if (!subtopic) return;
    const ctx = makeContext();
    queue({
      kind: "item",
      message: `Deleted subpoint ${subtopic.title}`,
      apply: (item) => removeSubtopic(item, pointId, subtopicId, ctx),
    });
  }

  function removeRoadmap(onRemoved: () => void) {
    const current = latest.current;
    if (!current) return;
    queue({ kind: "roadmap", message: `Deleted roadmap ${current.subject}`, onRemoved });
  }

  return {
    roadmap: roadmap && pending?.kind === "item" ? pending.apply(roadmap) : roadmap,
    loaded,
    error,
    expandedIds,
    generatingId,
    pending,
    setExpanded,
    commit,
    generateForPoint,
    addStage: (title: string) => commit((current) => addMainPoint(current, title, makeContext())),
    removeStage,
    removeSubpoint,
    removeRoadmap,
    undo,
    dismiss,
  };
}

export type RoadmapDetailState = ReturnType<typeof useRoadmapDetail>;
