// src/features/skill-architect/hooks/useSkillTree.ts
/**
 * State for one saved tree: loading, ticking skills, editing levels, and the "what's next" update.
 * Every change reloads the library first, so a change made elsewhere is not overwritten.
 */
import { useEffect, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import type { SkillArchitectTree, SkillLevel } from "../types";
import { updateSkillTree } from "../lib/generators";
import { applyProgressUpdate, cleanLevels, replaceLevels, toggleSkill } from "../lib/progress";
import { loadTrees, saveTrees } from "../lib/store";
import { findTree, removeTree, upsertTree } from "../lib/trees";

const nowIso = () => new Date().toISOString();

export function useSkillTree(treeId: string) {
  const { settings } = useAiSettings();
  const [trees, setTrees] = useState<SkillArchitectTree[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draftLevels, setDraftLevels] = useState<SkillLevel[]>([]);
  const [progressNote, setProgressNote] = useState("");
  const request = useRequest(updateSkillTree);

  useEffect(() => {
    let active = true;
    loadTrees().then((list) => {
      if (!active) return;
      setTrees(list);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const tree = findTree(trees, treeId);

  async function change(transform: (current: SkillArchitectTree) => SkillArchitectTree): Promise<boolean> {
    setSaveError(null);
    try {
      const current = await loadTrees();
      const existing = findTree(current, treeId);
      if (!existing) return false;
      const list = upsertTree(current, transform(existing));
      await saveTrees(list);
      setTrees(list);
      return true;
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save the skill tree.");
      return false;
    }
  }

  function startEdit() {
    if (!tree) return;
    setDraftLevels(tree.response.skillTreeLevels);
    setEditing(true);
  }

  async function saveEdit() {
    const levels = cleanLevels(draftLevels);
    const saved = await change((current) => replaceLevels(current, levels, nowIso()));
    if (saved) setEditing(false);
  }

  function toggle(skill: string) {
    void change((current) => toggleSkill(current, skill, nowIso()));
  }

  async function submitUpdate() {
    if (!tree) return;
    const note = progressNote.trim();
    const update = await request.run(settings, { tree, progressNote: note });
    if (!update) return;
    const saved = await change((current) => applyProgressUpdate(current, update, note, nowIso()));
    if (saved) setProgressNote("");
  }

  async function remove(): Promise<boolean> {
    setSaveError(null);
    try {
      await saveTrees(removeTree(await loadTrees(), treeId));
      return true;
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to delete the skill tree.");
      return false;
    }
  }

  return {
    loaded,
    tree,
    error: saveError ?? request.error,
    editing,
    draftLevels,
    setDraftLevels,
    startEdit,
    cancelEdit: () => setEditing(false),
    saveEdit,
    toggle,
    progressNote,
    setProgressNote,
    pending: request.pending,
    submitUpdate,
    remove,
  };
}

export type SkillTreeState = ReturnType<typeof useSkillTree>;
