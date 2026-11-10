// src/features/translator/components/TranslatorTool.tsx
/**
 * Translator: contextual translation with a chosen tone, reference material, and cultural notes.
 * The form sits in the footer; the last translation is kept on the device and shown above it.
 */
import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Languages, Lightbulb, Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActiveLanguageNotice } from "@/features/language-profiles/components/ActiveLanguageNotice";
import { useLanguageProfiles } from "@/features/language-profiles/providers/LanguageProfilesProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
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
import type { TranslationResponse, TranslatorFormValues } from "../types";

export interface TranslatorState {
  form: TranslatorFormValues;
  result: TranslationResponse | null;
  pending: boolean;
  error: string | null;
  update: <K extends keyof TranslatorFormValues>(key: K, value: TranslatorFormValues[K]) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useTranslator(): TranslatorState {
  const { settings } = useAiSettings();
  const { activeProfile } = useLanguageProfiles();
  const { form, setForm, result, setResult, reset: resetSaved } = usePersistedTranslation();
  const request = useRequest(translateText);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  function update<K extends keyof TranslatorFormValues>(key: K, value: TranslatorFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    abortRef.current?.abort();
    resetSaved();
    request.reset();
  }

  async function submit() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const next = await request.run(
      settings,
      {
        ...form,
        sourceLanguage: activeProfile.nativeLanguage,
        targetLanguage: activeProfile.targetLanguage,
      },
      controller.signal,
    );
    if (next && !controller.signal.aborted) setResult(next);
  }

  return {
    form,
    result,
    pending: request.pending,
    error: request.error,
    update,
    submit,
    reset,
  };
}

export function TranslatorResults({ translator }: { translator: TranslatorState }) {
  const { result } = translator;

  return (
    <Section>
      <ActiveLanguageNotice />
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
        <EmptyHint
          icon={Languages}
          title="No translation yet"
          hint="Enter the text below, choose a tone, then tap Translate."
        />
      )}
    </Section>
  );
}

export function TranslatorFooter({ translator }: { translator: TranslatorState }) {
  const { form, pending, error, update, submit } = translator;

  return (
    <View style={styles.footer}>
      <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent} keyboardShouldPersistTaps="handled">
        <TextField
          label="Text to translate"
          placeholder="Paste or type the text you want to translate…"
          value={form.textToTranslate}
          onChangeText={(text) => update("textToTranslate", text)}
          editable={!pending}
          maxLength={10000}
          multiline
          voice
        />
        <SelectField
          label="Tone"
          options={TONE_OPTIONS}
          value={form.tone}
          onChange={(value) => update("tone", value)}
          customPlaceholder="e.g. Friendly, Legal, Humorous"
        />
        <TextField
          label="User instructions (optional)"
          placeholder="e.g. avoid gendered pronouns, keep glossary terms as-is…"
          value={form.customInstructions}
          onChangeText={(text) => update("customInstructions", text)}
          editable={!pending}
          maxLength={1000}
          multiline
          voice
        />
      </ScrollView>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Translating with context…" : "Translate"}
        icon={Sparkles}
        loading={pending}
        onPress={submit}
      />
    </View>
  );
}

function quote(text: string): string {
  if (text === "") return "_No translation returned._";
  return `> ${text.replace(/\n/g, "\n> ")}`;
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  fields: {
    maxHeight: 380,
  },
  fieldsContent: {
    gap: spacing.md,
  },
});
