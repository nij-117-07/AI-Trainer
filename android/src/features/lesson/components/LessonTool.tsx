// src/features/lesson/components/LessonTool.tsx
/**
 * Language Lesson tool: the form for language, level, focus, and theme, with the generated lesson
 * below it. The draft and the last lesson are kept on the device.
 */
import { useEffect, useRef } from "react";
import { RefreshCcw, Sparkles } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { useRequest } from "@/hooks/useRequest";
import { generateLesson } from "../lib/generators";
import { usePersistedTool } from "../hooks/usePersistedTool";
import {
  COMPLEXITY_WEIGHT_OPTIONS,
  CEFR_LEVEL_OPTIONS,
  LEARNING_FOCUS_OPTIONS,
  LESSON_DEFAULTS,
} from "../options";
import type { Lesson, LessonFormValues } from "../types";
import { LessonResultView } from "./LessonResultView";

const STORAGE_KEY = "language-learner.lesson.generate.v1";

export function LessonTool() {
  const { settings } = useAiSettings();
  const { form, setForm, result, setResult, reset } = usePersistedTool<LessonFormValues, Lesson>(
    STORAGE_KEY,
    LESSON_DEFAULTS,
  );
  const request = useRequest(generateLesson);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  function update<K extends keyof LessonFormValues>(key: K, value: LessonFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    controller.current?.abort();
    reset();
    request.reset();
  }

  async function handleGenerate() {
    const current = new AbortController();
    controller.current = current;
    const next = await request.run(settings, form, current.signal);
    if (next && !current.signal.aborted) setResult(next);
  }

  return (
    <Section>
      <Panel>
        <TextField
          label="Target language"
          placeholder="e.g. Japanese"
          value={form.targetLanguage}
          onChangeText={(text) => update("targetLanguage", text)}
          editable={!request.pending}
          maxLength={100}
        />
        <TextField
          label="Native language"
          placeholder="e.g. English"
          value={form.nativeLanguage}
          onChangeText={(text) => update("nativeLanguage", text)}
          editable={!request.pending}
          maxLength={100}
        />
        <SelectField
          label="Current level"
          options={CEFR_LEVEL_OPTIONS}
          value={form.currentLevel}
          onChange={(value) => update("currentLevel", value)}
          allowCustom={false}
        />
        <SelectField
          label="Learning focus"
          options={LEARNING_FOCUS_OPTIONS}
          value={form.learningFocus}
          onChange={(value) => update("learningFocus", value)}
          allowCustom={false}
        />
        <SelectField
          label="Complexity weight"
          options={COMPLEXITY_WEIGHT_OPTIONS}
          value={form.complexityWeight}
          onChange={(value) => update("complexityWeight", value)}
          allowCustom={false}
        />
        <TextField
          label="Last lesson summary (optional)"
          placeholder="Recap of previous concepts…"
          hint="Helps the lesson build on what you already covered."
          value={form.lastLessonSummary}
          onChangeText={(text) => update("lastLessonSummary", text)}
          editable={!request.pending}
          maxLength={2000}
          multiline
        />
        <TextField
          label="Custom instruction (optional)"
          placeholder="e.g. Cyberpunk setting, focus on food vocabulary…"
          hint="Thematic constraints for the lesson."
          value={form.userCustomInstruction}
          onChangeText={(text) => update("userCustomInstruction", text)}
          editable={!request.pending}
          maxLength={2000}
          multiline
        />
        <TextField
          label="Seed (variety)"
          placeholder="Leave blank to auto-generate"
          hint="Change this to get a different lesson for the same inputs."
          value={form.seed}
          onChangeText={(text) => update("seed", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <ActionButton
          label={request.pending ? "Building your lesson…" : "Generate lesson"}
          icon={Sparkles}
          loading={request.pending}
          onPress={handleGenerate}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result && <LessonResultView lesson={result} />}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
    </Section>
  );
}
