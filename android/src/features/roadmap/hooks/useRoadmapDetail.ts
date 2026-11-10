// src/features/roadmap/hooks/useRoadmapDetail.ts
/**
 * State for one roadmap. Every edit updates the screen at once and saves in order. Expanding a main
 * point can generate its subpoints with AI and merges the result into the latest roadmap.
 */
import { useEffect, useRef, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { generateSubtopics } from "../lib/generators";
import {
  addMainPoint,
  applyExpansion,
  buildExpansionRequest,
  removeMainPoint,
  renameMainPoint,
  toggleMainPoint,
} from "../lib/roadmap-ops";
import { deleteRoadmap, getRoadmap, makeContext, saveRoadmap } from "../lib/roadmap-store";
import type { Roadmap } from "../types";

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function useRoadmapDetail(roadmapId: string) {
  const { settings } = useAiSettings();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const latest = useRef<Roadmap | null>(null);

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

  function commit(change: (current: Roadmap) => Roadmap) {
    const current = latest.current;
    if (!current) return;
    const next = change(current);
    if (next === current) return;
    latest.current = next;
    setRoadmap(next);
    setError(null);
    saveRoadmap(next).catch((err: unknown) => setError(messageOf(err, "Failed to save changes.")));
  }

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

  async function deleteCurrent(): Promise<boolean> {
    if (!roadmap) return false;
    try {
      await deleteRoadmap(roadmap.id);
      return true;
    } catch (err) {
      setError(messageOf(err, "Failed to delete the roadmap."));
      return false;
    }
  }

  return {
    roadmap,
    loaded,
    error,
    expandedIds,
    generatingId,
    setExpanded,
    commit,
    generateForPoint,
    deleteCurrent,
    addStage: (title: string) => commit((current) => addMainPoint(current, title, makeContext())),
  };
}

export type RoadmapDetailState = ReturnType<typeof useRoadmapDetail>;
