// src/features/guides/components/DailyPlanTab.tsx
/** Daily Study Plan: objective, gap analysis, roadmap, exercise, and resources for one day. */
import { CalendarDays, Flag, RefreshCcw, Sparkles, Target, Trophy, BookOpen } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { useRequest } from "@/hooks/useRequest";
import { generateDailyPlan } from "../lib/generators";
import { GUIDE_STORAGE_KEYS } from "../lib/persistence";
import {
  DAILY_PLAN_LEVEL_OPTIONS,
  LEARNING_FOCUS_OPTIONS,
  TARGET_MASTERY_OPTIONS,
} from "../options";
import { usePersistedGuide } from "../hooks/usePersistedGuide";
import type { DailyPlanFormValues, DailyPlanResult } from "../types";
import { ListPanel } from "./ResultParts";

const DEFAULTS: DailyPlanFormValues = {
  masterTopic: "React component design",
  subtopicPreference: "Compound components",
  userLevel: "intermediate",
  targetMastery: "competency",
  existingKnowledge: "Comfortable with hooks and props, but not context composition at scale.",
  learningFocus: "project-based",
  history: "",
};

export function DailyPlanTab() {
  const { settings } = useAiSettings();
  const { form, setForm, result, setResult, reset } = usePersistedGuide<DailyPlanFormValues, DailyPlanResult>(
    GUIDE_STORAGE_KEYS.dailyPlan,
    DEFAULTS,
  );
  const request = useRequest(generateDailyPlan);

  function update<K extends keyof DailyPlanFormValues>(key: K, value: DailyPlanFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    reset();
    request.reset();
  }

  async function handleGenerate() {
    const next = await request.run(settings, form);
    if (next) setResult(next);
  }

  return (
    <Section>
      <Panel>
        <TextField
          label="Master topic"
          placeholder="e.g. React component design"
          value={form.masterTopic}
          onChangeText={(text) => update("masterTopic", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <TextField
          label="Subtopic preference (optional)"
          placeholder="e.g. Compound components"
          value={form.subtopicPreference}
          onChangeText={(text) => update("subtopicPreference", text)}
          editable={!request.pending}
          maxLength={500}
        />
        <SelectField
          label="Your level"
          options={DAILY_PLAN_LEVEL_OPTIONS}
          value={form.userLevel}
          onChange={(value) => update("userLevel", value)}
          allowCustom={false}
        />
        <SelectField
          label="Target mastery"
          options={TARGET_MASTERY_OPTIONS}
          value={form.targetMastery}
          onChange={(value) => update("targetMastery", value)}
          allowCustom={false}
        />
        <TextField
          label="What you already know"
          placeholder="Summarize your current knowledge…"
          value={form.existingKnowledge}
          onChangeText={(text) => update("existingKnowledge", text)}
          editable={!request.pending}
          maxLength={2000}
          multiline
        />
        <SelectField
          label="Learning focus"
          options={LEARNING_FOCUS_OPTIONS}
          value={form.learningFocus}
          onChange={(value) => update("learningFocus", value)}
          allowCustom={false}
        />
        <TextField
          label="Previous session context (optional)"
          placeholder="Context from your last study session…"
          value={form.history}
          onChangeText={(text) => update("history", text)}
          editable={!request.pending}
          maxLength={2000}
          multiline
        />
        <ActionButton
          label={request.pending ? "Planning your day…" : "Generate daily plan"}
          icon={Sparkles}
          loading={request.pending}
          onPress={handleGenerate}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result && (
        <>
          {result.learningObjective !== "" && (
            <ResultCallout icon={Target} title="Learning objective" tone="sky">
              <MarkdownText content={result.learningObjective} />
            </ResultCallout>
          )}
          {result.masteryGapAnalysis !== "" && (
            <ResultCallout icon={Flag} title="Mastery gap analysis" tone="amber">
              <MarkdownText content={result.masteryGapAnalysis} />
            </ResultCallout>
          )}
          <ListPanel icon={CalendarDays} title="Structured roadmap" items={result.structuredRoadmap} numbered />
          {result.recommendedExercise !== "" && (
            <ResultCallout icon={Trophy} title="Recommended exercise" tone="emerald">
              <MarkdownText content={result.recommendedExercise} />
            </ResultCallout>
          )}
          {result.resourceSuggestions !== "" && (
            <ResultCallout icon={BookOpen} title="Resources and suggestions" tone="rose">
              <MarkdownText content={result.resourceSuggestions} />
            </ResultCallout>
          )}
        </>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
    </Section>
  );
}
