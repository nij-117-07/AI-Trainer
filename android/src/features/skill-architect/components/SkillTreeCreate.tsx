// src/features/skill-architect/components/SkillTreeCreate.tsx
/**
 * Create form for a new skill tree. The topic is generated into a root-skill progression tree,
 * saved on the device, and then opened on its detail page. The draft is kept between visits.
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { RefreshCcw, Sparkles } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { useRequest } from "@/hooks/useRequest";
import type { SkillArchitectFormValues } from "../types";
import { generateSkillTree } from "../lib/generators";
import { clearDraft, loadDraft, loadTrees, saveDraft, saveTrees } from "../lib/store";
import { buildTree, createTreeId, upsertTree } from "../lib/trees";
import { SKILL_LIMITS } from "../lib/validate";

const DEFAULTS: SkillArchitectFormValues = {
  domainOrSkill: "System Design and Software Architecture",
  currentProficiency: "Junior Developer with 1 year of experience",
  targetMasteryLevel: "Staff Engineer / Principal Architect",
  learningConstraints: "I only have 5 hours a week to study.",
};

export function SkillTreeCreate() {
  const router = useRouter();
  const { settings } = useAiSettings();
  const [form, setForm] = useState<SkillArchitectFormValues>(DEFAULTS);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const request = useRequest(generateSkillTree);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;
    loadDraft(DEFAULTS).then((draft) => {
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
    setForm(DEFAULTS);
    setSaveError(null);
    request.reset();
  }

  async function handleGenerate() {
    setSaveError(null);
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const response = await request.run(settings, form, controller.signal);
    if (!response || controller.signal.aborted) return;

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const tree = buildTree({
        id: createTreeId(Date.now()),
        topic: form.domainOrSkill,
        response,
        now,
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

  return (
    <Section>
      <Panel>
        <TextField
          label="Topic / Domain to deconstruct"
          placeholder="e.g. Docker, React, Machine Learning, Public Speaking…"
          hint="Enter any topic — a new skill tree will be generated for it."
          value={form.domainOrSkill}
          onChangeText={(text) => update("domainOrSkill", text)}
          editable={!busy}
          maxLength={SKILL_LIMITS.domainOrSkill}
        />
        <TextField
          label="Current Proficiency"
          placeholder="Describe your current level…"
          hint="Where you are today, e.g. absolute beginner, self-taught, intermediate."
          value={form.currentProficiency}
          onChangeText={(text) => update("currentProficiency", text)}
          editable={!busy}
          maxLength={SKILL_LIMITS.currentProficiency}
          multiline
        />
        <TextField
          label="Target Mastery Level"
          placeholder="e.g. Competent Professional, Industry Expert, Master"
          value={form.targetMasteryLevel}
          onChangeText={(text) => update("targetMasteryLevel", text)}
          editable={!busy}
          maxLength={SKILL_LIMITS.targetMasteryLevel}
        />
        <TextField
          label="Learning Constraints"
          placeholder="Optional — time, resources, or preferred learning style…"
          hint="Optional."
          value={form.learningConstraints}
          onChangeText={(text) => update("learningConstraints", text)}
          editable={!busy}
          maxLength={SKILL_LIMITS.learningConstraints}
          multiline
        />
        <ActionButton
          label={busy ? "Deconstructing skills…" : "Generate Skill Tree"}
          icon={Sparkles}
          loading={busy}
          onPress={handleGenerate}
        />
      </Panel>

      <ErrorText message={request.error ?? saveError} />

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={reset} />
    </Section>
  );
}
