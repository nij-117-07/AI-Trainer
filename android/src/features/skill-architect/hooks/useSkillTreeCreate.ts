// src/features/skill-architect/hooks/useSkillTreeCreate.ts
/**
 * State for the create page: the form (kept between visits), the generate request, and saving the
 * new tree before it opens on its detail page.
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import type { SkillArchitectFormValues } from "../types";
import { generateSkillTree } from "../lib/generators";
import { clearDraft, loadDraft, loadTrees, saveDraft, saveTrees } from "../lib/store";
import { buildTree, createTreeId, upsertTree } from "../lib/trees";

const EMPTY_FORM: SkillArchitectFormValues = {
  domainOrSkill: "",
  currentProficiency: "",
  targetMasteryLevel: "",
  learningConstraints: "",
};

export function useSkillTreeCreate() {
  const router = useRouter();
  const { settings } = useAiSettings();
  const [form, setForm] = useState<SkillArchitectFormValues>(EMPTY_FORM);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const request = useRequest(generateSkillTree);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;
    loadDraft(EMPTY_FORM).then((draft) => {
      if (!active) return;
      setForm(draft);
      setDraftLoaded(true);
    });
    return () => {
      active = false;
      controllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (draftLoaded) void saveDraft(form);
  }, [form, draftLoaded]);

  function update<K extends keyof SkillArchitectFormValues>(key: K, value: SkillArchitectFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    setForm(EMPTY_FORM);
    setSaveError(null);
    request.reset();
  }

  async function submit() {
    setSaveError(null);
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const response = await request.run(settings, form, controller.signal);
    if (!response || controller.signal.aborted) return;

    setSaving(true);
    try {
      const tree = buildTree({
        id: createTreeId(Date.now()),
        topic: form.domainOrSkill,
        response,
        now: new Date().toISOString(),
      });
      const trees = await loadTrees();
      await saveTrees(upsertTree(trees, tree));
      await clearDraft();
      router.replace(`/learning/skill-architect/${tree.id}` as never);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save the skill tree.");
    } finally {
      setSaving(false);
    }
  }

  const busy = request.pending || saving;

  return {
    form,
    busy,
    error: request.error ?? saveError,
    update,
    reset,
    submit,
  };
}

export type SkillTreeCreateState = ReturnType<typeof useSkillTreeCreate>;
