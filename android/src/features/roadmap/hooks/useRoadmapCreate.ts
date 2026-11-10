// src/features/roadmap/hooks/useRoadmapCreate.ts
/**
 * State for the new-roadmap page. Step "setup" holds the form; step "review" holds the generated
 * main points, which the user can edit before the roadmap is created. The draft is kept on the device.
 */
import { useEffect, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { ROADMAP_FORM_DEFAULTS } from "../options";
import { generateRoadmapPlan } from "../lib/generators";
import { createRoadmap } from "../lib/roadmap-ops";
import { clearDraft, loadDraft, makeContext, saveDraft, saveRoadmap } from "../lib/roadmap-store";
import { ROADMAP_LIMITS } from "../lib/validation";
import type { RoadmapFormValues } from "../types";

export type CreateStep = "setup" | "review";

export function useRoadmapCreate(onCreated: (roadmapId: string) => void) {
  const { settings } = useAiSettings();
  const [form, setForm] = useState<RoadmapFormValues>(ROADMAP_FORM_DEFAULTS);
  const [persona, setPersona] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [step, setStep] = useState<CreateStep>("setup");
  const [draftReady, setDraftReady] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const request = useRequest(generateRoadmapPlan);

  useEffect(() => {
    let active = true;
    loadDraft()
      .catch(() => null)
      .then((draft) => {
        if (!active) return;
        if (draft) {
          setForm(draft.form);
          setPersona(draft.persona);
          setTopics(draft.topics);
          setStep(draft.topics.length > 0 ? "review" : "setup");
        }
        setDraftReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    saveDraft({ form, persona, topics }).catch(() => undefined);
  }, [draftReady, form, persona, topics]);

  function update<K extends keyof RoadmapFormValues>(key: K, value: RoadmapFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function generate() {
    const plan = await request.run(settings, form);
    if (!plan) return;
    setPersona(plan.persona);
    setTopics(plan.mainTopics);
    if (plan.mainTopics.length > 0) {
      setCreateError(null);
      setStep("review");
    } else {
      setCreateError("No main points came back. Try again.");
    }
  }

  async function create() {
    setCreateError(null);
    setCreating(true);
    try {
      const roadmap = createRoadmap({ form, persona, topics }, makeContext());
      await saveRoadmap(roadmap);
      await clearDraft();
      onCreated(roadmap.id);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create the roadmap.");
    } finally {
      setCreating(false);
    }
  }

  function reset() {
    setForm(ROADMAP_FORM_DEFAULTS);
    setPersona("");
    setTopics([]);
    setStep("setup");
    setCreateError(null);
    request.reset();
    clearDraft().catch(() => undefined);
  }

  function removeTopic(index: number) {
    setTopics((current) => current.filter((_, i) => i !== index));
  }

  function addTopic(title: string) {
    const clean = title.trim().slice(0, ROADMAP_LIMITS.title);
    if (clean) setTopics((current) => [...current, clean]);
  }

  const busy = request.pending || creating;

  return {
    form,
    step,
    topics,
    busy,
    generating: request.pending,
    creating,
    generateError: request.error,
    createError,
    update,
    generate,
    create,
    reset,
    back: () => setStep("setup"),
    removeTopic,
    addTopic,
  };
}

export type RoadmapCreateState = ReturnType<typeof useRoadmapCreate>;
