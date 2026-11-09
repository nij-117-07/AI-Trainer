// src/features/motivation/components/ReflectTab.tsx
/** Reflection Journal: three open-ended journaling prompts and one perspective shift. */
import { NotebookPen, Lightbulb, RefreshCcw, Sparkles } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { ListenButton } from "@/components/tool/ListenButton";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { generateReflection } from "../lib/generators";
import { REFLECTION_DEFAULTS, REFLECTION_DRAFT_KEY, restoreReflectionDraft } from "../lib/drafts";
import type { ReflectionFormValues, ReflectionResult } from "../lib/types";
import { useDraft } from "../hooks/useDraft";

export function ReflectTab() {
  const { settings } = useAiSettings();
  const draft = useDraft<ReflectionFormValues, ReflectionResult>(
    REFLECTION_DRAFT_KEY,
    REFLECTION_DEFAULTS,
    restoreReflectionDraft,
  );
  const request = useRequest(generateReflection);
  const { form, result } = draft;

  function update<K extends keyof ReflectionFormValues>(key: K, value: ReflectionFormValues[K]) {
    draft.setForm((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    draft.reset();
    request.reset();
  }

  async function handleGenerate() {
    const generated = await request.run(settings, form);
    if (generated) draft.setResult(generated);
  }

  return (
    <Section>
      <Panel>
        <TextField
          label="Current mood"
          placeholder="e.g. Anxious about work."
          value={form.currentMood}
          onChangeText={(text) => update("currentMood", text)}
          editable={!request.pending}
          maxLength={500}
          multiline
          voice
        />
        <TextField
          label="Goal or value to focus on"
          placeholder="e.g. Creative independence"
          value={form.goalAlignment}
          onChangeText={(text) => update("goalAlignment", text)}
          editable={!request.pending}
          maxLength={500}
        />
        <TextField
          label="Recent patterns (optional)"
          placeholder="Mood or progress trends from the past week…"
          value={form.recentPatterns}
          onChangeText={(text) => update("recentPatterns", text)}
          editable={!request.pending}
          maxLength={1000}
          multiline
          voice
        />
        <ActionButton
          label={request.pending ? "Reflecting…" : "Generate prompts"}
          icon={Sparkles}
          loading={request.pending}
          onPress={handleGenerate}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result && (
        <>
          <Panel>
            <SectionTitle icon={NotebookPen} title="Journaling prompts" />
            <MarkdownText
              content={
                result.prompts.length > 0
                  ? result.prompts.map((prompt, index) => `${index + 1}. ${prompt}`).join("\n")
                  : "_No prompts returned._"
              }
            />
            <ListenButton text={result.prompts.join(" ")} label="Prompts" />
          </Panel>
          {result.perspectiveShift.trim() !== "" && (
            <ResultCallout icon={Lightbulb} title="Perspective shift" tone="sky">
              <MarkdownText content={result.perspectiveShift} />
              <ListenButton text={result.perspectiveShift} label="Perspective shift" />
            </ResultCallout>
          )}
        </>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={reset} />
    </Section>
  );
}
