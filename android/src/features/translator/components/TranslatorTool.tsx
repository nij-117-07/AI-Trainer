/**
 * Translator: contextual translation with a chosen tone, optional notes, and notes on the choices made.
 * On phones the source comes first and the translation below it. On tablet and desktop the source
 * and the translation sit side by side. The Translate action is always the footer.
 */
import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Languages, Lightbulb, Sparkles } from "lucide-react-native";
import { spacing, typeScale, useLayout, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActiveLanguageNotice } from "@/features/language-profiles/components/ActiveLanguageNotice";
import { useLanguageProfiles } from "@/features/language-profiles/providers/LanguageProfilesProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { CopyButton } from "@/components/tool/CopyButton";
import { Disclosure } from "@/components/tool/Disclosure";
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
import { SAVE_FAILED_MESSAGE, usePersistedTranslation } from "../hooks/usePersistedTranslation";
import type { TranslationResponse, TranslatorFormValues } from "../types";

export interface TranslatorState {
  form: TranslatorFormValues;
  result: TranslationResponse | null;
  pending: boolean;
  error: string | null;
  saveError: boolean;
  update: <K extends keyof TranslatorFormValues>(key: K, value: TranslatorFormValues[K]) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useTranslator(): TranslatorState {
  const { settings } = useAiSettings();
  const { activeProfile } = useLanguageProfiles();
  const { form, setForm, result, setResult, reset: resetSaved, saveError } = usePersistedTranslation();
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
    saveError,
    update,
    submit,
    reset,
  };
}

export function TranslatorPanes({ translator }: { translator: TranslatorState }) {
  const { size } = useLayout();
  const sideBySide = size !== "phone";

  return (
    <View style={[styles.panes, sideBySide && styles.panesWide]}>
      <View style={sideBySide && styles.pane}>
        <TranslatorSource translator={translator} />
      </View>
      <View style={sideBySide && styles.pane}>
        <TranslatorResults translator={translator} />
      </View>
    </View>
  );
}

function TranslatorSource({ translator }: { translator: TranslatorState }) {
  const { form, pending, update } = translator;

  return (
    <Panel>
      <ActiveLanguageNotice />
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
        label="Notes (optional)"
        placeholder="e.g. avoid gendered pronouns, keep glossary terms as-is…"
        value={form.customInstructions}
        onChangeText={(text) => update("customInstructions", text)}
        editable={!pending}
        maxLength={1000}
        multiline
        voice
      />
    </Panel>
  );
}

export function TranslatorResults({ translator }: { translator: TranslatorState }) {
  const colors = useThemeColors();
  const { result } = translator;

  if (!result) {
    return <EmptyHint icon={Languages} title="No translation yet" hint="Your translation appears here." />;
  }

  const notes = result.rationale !== "" || result.culturalNotes !== "";

  return (
    <Section>
      <ResultCallout icon={Languages} title="Translation" tone="sky">
        <Text selectable style={[styles.translation, { color: colors.foreground }]}>
          {result.translatedText === "" ? "No translation returned." : result.translatedText}
        </Text>
        <View style={styles.actions}>
          {result.translatedText !== "" && (
            <>
              <ListenButton text={result.translatedText} label="Translation" />
              <CopyButton text={result.translatedText} label="Copy translation" />
            </>
          )}
        </View>
      </ResultCallout>

      {notes && (
        <Disclosure title="Notes on choices" summary={summaryOf(result.rationale) || summaryOf(result.culturalNotes)}>
          {result.rationale !== "" && (
            <View style={styles.note}>
              <MarkdownText content={result.rationale} />
              <ListenButton text={result.rationale} label="Explanation" />
            </View>
          )}

          {result.culturalNotes !== "" && (
            <View style={styles.note}>
              <SectionTitle icon={Lightbulb} title="Cultural notes" />
              <MarkdownText content={result.culturalNotes} />
              <ListenButton text={result.culturalNotes} label="Cultural notes" />
            </View>
          )}
        </Disclosure>
      )}
    </Section>
  );
}

export function TranslatorFooter({ translator }: { translator: TranslatorState }) {
  const { pending, error, saveError, submit } = translator;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ErrorText message={saveError ? SAVE_FAILED_MESSAGE : null} />
      <ActionButton
        label={pending ? "Translating…" : "Translate"}
        icon={Sparkles}
        loading={pending}
        onPress={submit}
      />
    </View>
  );
}

function summaryOf(text: string): string {
  const line = text.split("\n").find((item) => item.trim() !== "") ?? "";
  return line.replace(/[*_`#>]/g, "").trim();
}

const styles = StyleSheet.create({
  panes: {
    gap: spacing.lg,
  },
  panesWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  pane: {
    flex: 1,
    minWidth: 0,
  },
  translation: {
    ...typeScale.title,
    fontWeight: "400",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
  },
  note: {
    gap: spacing.sm,
  },
  footer: {
    gap: spacing.sm,
  },
});
