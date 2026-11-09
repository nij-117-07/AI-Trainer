// src/features/translator/components/TranslatorTool.tsx
/** Translator: contextual translation with a chosen tone, reference material, and cultural notes. */
import { useEffect, useRef } from "react";
import { StyleSheet, Text } from "react-native";
import { Languages, Lightbulb, RefreshCcw, Sparkles } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { translateText } from "../lib/generators";
import { TONE_OPTIONS } from "../options";
import { usePersistedTranslation } from "../hooks/usePersistedTranslation";
import type { TranslatorFormValues } from "../types";

export function TranslatorTool() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const { form, setForm, result, setResult, reset } = usePersistedTranslation();
  const request = useRequest(translateText);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  function update<K extends keyof TranslatorFormValues>(key: K, value: TranslatorFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    abortRef.current?.abort();
    reset();
    request.reset();
  }

  async function handleTranslate() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const next = await request.run(settings, form, controller.signal);
    if (next && !controller.signal.aborted) setResult(next);
  }

  return (
    <Section>
      <Panel>
        <TextField
          label="Text to Translate"
          placeholder="Paste the text you want to translate…"
          value={form.textToTranslate}
          onChangeText={(text) => update("textToTranslate", text)}
          editable={!request.pending}
          maxLength={10000}
          multiline
          voice
        />
        <TextField
          label="Source Language"
          placeholder="e.g. English"
          value={form.sourceLanguage}
          onChangeText={(text) => update("sourceLanguage", text)}
          editable={!request.pending}
          maxLength={100}
        />
        <TextField
          label="Target Language"
          placeholder="e.g. Japanese"
          value={form.targetLanguage}
          onChangeText={(text) => update("targetLanguage", text)}
          editable={!request.pending}
          maxLength={100}
        />
        <SelectField
          label="Tone"
          options={TONE_OPTIONS}
          value={form.tone}
          onChange={(value) => update("tone", value)}
          allowCustom={false}
        />
        <TextField
          label="Reference Material"
          placeholder="Optional — glossary or context snippets for consistency…"
          hint="Optional."
          value={form.referenceMaterial}
          onChangeText={(text) => update("referenceMaterial", text)}
          editable={!request.pending}
          maxLength={4000}
          multiline
          voice
        />
        <TextField
          label="Custom Instructions"
          placeholder="Optional — e.g. avoid gendered pronouns…"
          hint="Optional."
          value={form.customInstructions}
          onChangeText={(text) => update("customInstructions", text)}
          editable={!request.pending}
          maxLength={1000}
          multiline
          voice
        />
        <ActionButton
          label={request.pending ? "Translating with context…" : "Translate"}
          icon={Sparkles}
          loading={request.pending}
          onPress={handleTranslate}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result ? (
        <>
          <ResultCallout icon={Languages} title="Translation" tone="sky">
            <MarkdownText content={quote(result.translatedText)} />
            <ListenButton text={result.translatedText} label="Translation" />
          </ResultCallout>

          {result.culturalNotes !== "" && (
            <Panel>
              <SectionTitle icon={Lightbulb} title="Cultural notes" />
              <MarkdownText content={result.culturalNotes} />
              <ListenButton text={result.culturalNotes} label="Cultural notes" />
            </Panel>
          )}

          {result.rationale !== "" && (
            <Panel>
              <SectionTitle icon={Languages} title="Why this translation" />
              <MarkdownText content={result.rationale} />
              <ListenButton text={result.rationale} label="Explanation" />
            </Panel>
          )}
        </>
      ) : (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>
          Add your text and translate to see a contextual translation with cultural notes.
        </Text>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
    </Section>
  );
}

function quote(text: string): string {
  if (text === "") return "_No translation returned._";
  return `> ${text.replace(/\n/g, "\n> ")}`;
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
});
