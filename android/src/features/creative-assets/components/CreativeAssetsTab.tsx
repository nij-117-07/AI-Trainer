// src/features/creative-assets/components/CreativeAssetsTab.tsx
/** Creative Assets: names, titles, hashtags, and slogans, each with a short explanation. */
import { useEffect, useRef } from "react";
import { StyleSheet, Text } from "react-native";
import { Lightbulb, Palette, RefreshCcw, Sparkles } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { CountSlider } from "@/components/tool/CountSlider";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { generateCreativeAssets } from "../lib/generators";
import { CREATIVE_ASSETS_STORAGE_KEY } from "../lib/persistence";
import { TASK_TYPE_OPTIONS } from "../options";
import { usePersistedDraft } from "../hooks/usePersistedDraft";
import type { CreativeAssetsFormValues, CreativeAssetsResult } from "../types";

const DEFAULTS: CreativeAssetsFormValues = {
  taskType: "Hashtags",
  userQuery: "Eco-friendly bamboo toothbrushes",
  context: "Targeting Gen Z on Instagram who care about zero-waste living.",
  referenceExamples: "#SustainableLiving\n#GreenRoutine",
  numberOfSuggestions: 3,
};

export function CreativeAssetsTab() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const { form, setForm, result, setResult, reset } = usePersistedDraft<CreativeAssetsFormValues, CreativeAssetsResult>(
    CREATIVE_ASSETS_STORAGE_KEY,
    DEFAULTS,
  );
  const request = useRequest(generateCreativeAssets);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  function update<K extends keyof CreativeAssetsFormValues>(key: K, value: CreativeAssetsFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    controllerRef.current?.abort();
    reset();
    request.reset();
  }

  async function handleGenerate() {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const next = await request.run(settings, form, controller.signal);
    if (next && !controller.signal.aborted) setResult(next);
  }

  const cancelled = controllerRef.current?.signal.aborted ?? false;

  return (
    <Section>
      <Panel>
        <SelectField
          label="Task type"
          options={TASK_TYPE_OPTIONS}
          value={form.taskType}
          onChange={(value) => update("taskType", value)}
          allowCustom={false}
        />
        <TextField
          label="Topic / product description"
          placeholder="The primary topic or raw idea…"
          value={form.userQuery}
          onChangeText={(text) => update("userQuery", text)}
          editable={!request.pending}
          maxLength={2000}
          multiline
          voice
        />
        <TextField
          label="Context (optional)"
          placeholder="Target audience, tone, or marketing goals…"
          value={form.context}
          onChangeText={(text) => update("context", text)}
          editable={!request.pending}
          maxLength={2000}
          multiline
          voice
        />
        <TextField
          label="Reference examples (optional)"
          placeholder="One example per line of names/tags you like…"
          value={form.referenceExamples}
          onChangeText={(text) => update("referenceExamples", text)}
          editable={!request.pending}
          maxLength={3000}
          multiline
        />
        <CountSlider
          label="Number of suggestions"
          max={20}
          value={form.numberOfSuggestions}
          onChange={(value) => update("numberOfSuggestions", value)}
        />
        <ActionButton
          label={request.pending ? "Brainstorming…" : "Generate assets"}
          icon={Sparkles}
          loading={request.pending}
          onPress={handleGenerate}
        />
      </Panel>

      <ErrorText message={cancelled ? null : request.error} />

      {result && (
        <>
          <SectionTitle icon={Palette} title="Suggestions" />
          {result.suggestions.length === 0 ? (
            <Text style={[styles.empty, { color: colors.mutedForeground }]}>No assets were returned.</Text>
          ) : (
            result.suggestions.map((item, index) => (
              <Panel key={`${item.suggestion}-${index}`}>
                <Text style={[styles.title, { color: colors.foreground }]}>
                  {index + 1}. {item.suggestion}
                </Text>
                {item.explanation !== "" && (
                  <ResultCallout icon={Lightbulb} title="Why it works" tone="amber">
                    <MarkdownText content={item.explanation} />
                    <ListenButton text={item.explanation} label="Explanation" />
                  </ResultCallout>
                )}
              </Panel>
            ))
          )}
        </>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
    </Section>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
});
