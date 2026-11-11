/**
 * Rewriter: rewrites text for a tone, audience, and goal, with the rationale and the changes made.
 * The form is the side panel on tablet and desktop and the first part of the page on phones. The
 * last rewrite is kept on the device and shown in the results.
 */
import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Lightbulb, ListChecks, PenLine, Sparkles } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import {
  ActionButton,
  ErrorText,
  Panel,
  TextField,
} from "@/components/tool/FormControls";
import { CopyButton } from "@/components/tool/CopyButton";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ListenButton } from "@/components/tool/ListenButton";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { rewriteText } from "../lib/generators";
import { REWRITER_STORAGE_KEY } from "../lib/persistence";
import {
  AUDIENCE_OPTIONS,
  TONE_OPTIONS,
  TRANSFORMATION_GOAL_OPTIONS,
} from "../options";
import { usePersistedDraft } from "../hooks/usePersistedDraft";
import type { RewriteFormValues, RewriteResult } from "../types";

const DEFAULTS: RewriteFormValues = {
  originalText: "",
  targetTone: "professional",
  audience: "general audience",
  transformationGoal: "paraphrase",
  customInstructions: "",
};

export interface RewriterState {
  form: RewriteFormValues;
  result: RewriteResult | null;
  pending: boolean;
  error: string | null;
  update: <K extends keyof RewriteFormValues>(key: K, value: RewriteFormValues[K]) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useRewriter(): RewriterState {
  const { settings } = useAiSettings();
  const { form, setForm, result, setResult, reset: resetSaved } = usePersistedDraft<
    RewriteFormValues,
    RewriteResult
  >(REWRITER_STORAGE_KEY, DEFAULTS);
  const request = useRequest(rewriteText);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  function update<K extends keyof RewriteFormValues>(key: K, value: RewriteFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    controllerRef.current?.abort();
    resetSaved();
    request.reset();
  }

  async function submit() {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const next = await request.run(settings, form, controller.signal);
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

export function RewriterResults({ rewriter }: { rewriter: RewriterState }) {
  const colors = useThemeColors();
  const { result } = rewriter;

  return (
    <Section>
      {result ? (
        <>
          <ResultCallout icon={PenLine} title="Rewritten text" tone="emerald">
            <MarkdownText
              content={result.rewrittenText ? quote(result.rewrittenText) : "_No rewrite was returned._"}
            />
            <View style={styles.actions}>
              <ListenButton text={result.rewrittenText} label="Rewrite" />
              {result.rewrittenText !== "" && (
                <CopyButton text={result.rewrittenText} label="Copy rewrite" />
              )}
            </View>
          </ResultCallout>

          {result.rationale !== "" && (
            <ResultCallout icon={Lightbulb} title="Rationale" tone="sky">
              <MarkdownText content={result.rationale} />
              <ListenButton text={result.rationale} label="Rationale" />
            </ResultCallout>
          )}

          <Panel>
            <SectionTitle icon={ListChecks} title="Improvements made" />
            {result.improvementsMade.length === 0 ? (
              <Text style={[styles.empty, { color: colors.mutedForeground }]}>No improvements were listed.</Text>
            ) : (
              <MarkdownText content={result.improvementsMade.map((item) => `- ${item}`).join("\n")} />
            )}
          </Panel>
        </>
      ) : (
        <EmptyHint
          icon={PenLine}
          title="No rewrite yet"
          hint="Enter text in the form, set the tone and audience, then tap Rewrite."
        />
      )}
    </Section>
  );
}

export function RewriterFooter({ rewriter }: { rewriter: RewriterState }) {
  const colors = useThemeColors();
  const { form, pending, error, update, submit } = rewriter;

  return (
    <View style={styles.form}>
      <TextField
        label="Original text"
        placeholder="Paste the text you want to rewrite…"
        value={form.originalText}
        onChangeText={(text) => update("originalText", text)}
        editable={!pending}
        maxLength={10000}
        multiline
        voice
      />
      <SelectField
        label="Target tone"
        options={TONE_OPTIONS}
        value={form.targetTone}
        onChange={(value) => update("targetTone", value)}
        customPlaceholder="e.g. Sarcastic, Poetic, Urgent"
      />
      <SelectField
        label="Audience"
        options={AUDIENCE_OPTIONS}
        value={form.audience}
        onChange={(value) => update("audience", value)}
        customPlaceholder="e.g. Hiring managers, Kids aged 8–10"
      />
      <SelectField
        label="Transformation goal"
        options={TRANSFORMATION_GOAL_OPTIONS}
        value={form.transformationGoal}
        onChange={(value) => update("transformationGoal", value)}
        customPlaceholder="e.g. Formalise, Localise, Bullet points"
      />
      <TextField
        label="User instructions (optional)"
        placeholder="e.g. keep it under 15 words…"
        value={form.customInstructions}
        onChangeText={(text) => update("customInstructions", text)}
        editable={!pending}
        maxLength={1000}
        multiline
        voice
      />
      {pending ? (
        <Text accessibilityLiveRegion="polite" style={[styles.status, { color: colors.mutedForeground }]}>
          Working on your rewrite. This can take a moment.
        </Text>
      ) : null}
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Rewriting…" : "Rewrite"}
        icon={Sparkles}
        loading={pending}
        onPress={submit}
      />
    </View>
  );
}

function quote(text: string): string {
  return text
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
  status: {
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
});
