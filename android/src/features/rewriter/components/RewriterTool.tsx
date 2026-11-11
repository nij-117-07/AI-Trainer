/**
 * Rewriter: rewrites text for a tone, audience, and goal, with the rationale and the changes made.
 * The original text and its options sit beside the rewrite on wide windows and above it on phones.
 * The last rewrite is kept on the device and shown in the results.
 */
import { useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ArrowUp, Lightbulb, ListChecks, PenLine, Sparkles } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import {
  ActionButton,
  ChoiceChips,
  ErrorText,
  Field,
  pointerCursor,
  TextField,
} from "@/components/tool/FormControls";
import { CopyButton } from "@/components/tool/CopyButton";
import { Disclosure } from "@/components/tool/Disclosure";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ListenButton } from "@/components/tool/ListenButton";
import { SelectField } from "@/components/tool/SelectField";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { useRequest } from "@/hooks/useRequest";
import { rewriteText } from "../lib/generators";
import { REWRITER_STORAGE_KEY, SAVE_FAILED_MESSAGE } from "../lib/persistence";
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
  saveError: boolean;
  update: <K extends keyof RewriteFormValues>(key: K, value: RewriteFormValues[K]) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useRewriter(): RewriterState {
  const { settings } = useAiSettings();
  const { form, setForm, result, setResult, reset: resetSaved, saveError } = usePersistedDraft<
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
    saveError,
    update,
    submit,
    reset,
  };
}

export function RewriterSource({ rewriter }: { rewriter: RewriterState }) {
  const { form, pending, update } = rewriter;
  const goalOptions = TRANSFORMATION_GOAL_OPTIONS.some((option) => option.value === form.transformationGoal)
    ? TRANSFORMATION_GOAL_OPTIONS
    : [...TRANSFORMATION_GOAL_OPTIONS, { value: form.transformationGoal, label: form.transformationGoal }];

  return (
    <View style={styles.stack}>
      <TextField
        label="Original text"
        placeholder="e.g. Paste a paragraph from an email"
        value={form.originalText}
        onChangeText={(text) => update("originalText", text)}
        editable={!pending}
        maxLength={10000}
        multiline
        voice
      />
      <SelectField
        label="Tone"
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
      <Field label="Goal">
        <ChoiceChips
          options={goalOptions}
          value={form.transformationGoal}
          onChange={(value) => update("transformationGoal", value)}
          disabled={pending}
        />
      </Field>
      <TextField
        label="Instructions (optional)"
        placeholder="e.g. Keep it under 15 words"
        value={form.customInstructions}
        onChangeText={(text) => update("customInstructions", text)}
        editable={!pending}
        maxLength={1000}
        multiline
        voice
      />
    </View>
  );
}

export function RewriterResults({ rewriter }: { rewriter: RewriterState }) {
  const colors = useThemeColors();
  const { result, pending, update } = rewriter;

  if (!result) {
    return <EmptyHint icon={PenLine} title="No rewrite yet" hint="Your rewrite appears here." />;
  }

  const rewritten = result.rewrittenText;

  return (
    <View style={styles.stack}>
      <ResultCallout icon={PenLine} title="Rewrite" tone="emerald">
        {rewritten ? (
          <MarkdownText content={rewritten} />
        ) : (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>No rewrite was returned.</Text>
        )}
        <View style={styles.actions}>
          <ListenButton text={rewritten} label="Rewrite" />
          {rewritten !== "" && (
            <>
              <CopyButton text={rewritten} label="Copy rewrite" />
              <UseAsOriginalButton disabled={pending} onPress={() => update("originalText", rewritten)} />
            </>
          )}
        </View>
      </ResultCallout>

      {result.rationale !== "" && (
        <Disclosure title="Rationale" icon={Lightbulb} summary={oneLine(result.rationale)}>
          <MarkdownText content={result.rationale} />
          <ListenButton text={result.rationale} label="Rationale" />
        </Disclosure>
      )}

      <Disclosure title="Changes made" icon={ListChecks} summary={changesSummary(result.improvementsMade)}>
        {result.improvementsMade.length === 0 ? (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>No changes were listed.</Text>
        ) : (
          <MarkdownText content={result.improvementsMade.map((item) => `- ${item}`).join("\n")} />
        )}
      </Disclosure>
    </View>
  );
}

export function RewriterFooter({ rewriter }: { rewriter: RewriterState }) {
  const { pending, error, saveError, submit } = rewriter;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ErrorText message={saveError ? SAVE_FAILED_MESSAGE : null} />
      <ActionButton
        label={pending ? "Rewriting…" : "Rewrite"}
        icon={Sparkles}
        loading={pending}
        onPress={submit}
      />
    </View>
  );
}

function UseAsOriginalButton({ disabled, onPress }: { disabled: boolean; onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Use rewrite as original"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.iconButton,
        pointerCursor,
        { borderColor: colors.border, backgroundColor: colors.card },
        pressed && { backgroundColor: colors.muted },
        disabled && styles.disabled,
      ]}
    >
      <ArrowUp size={20} color={colors.foreground} />
    </Pressable>
  );
}

function oneLine(text: string): string {
  return text.replace(/[`*_#>]/g, "").replace(/\s+/g, " ").trim();
}

function changesSummary(items: string[]): string {
  if (items.length === 0) return "No changes listed";
  const count = `${items.length} ${items.length === 1 ? "change" : "changes"}`;
  return `${count}: ${oneLine(items[0])}`;
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
  footer: {
    gap: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconButton: {
    width: touchTarget,
    height: touchTarget,
    borderWidth: 1,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
  empty: {
    ...typeScale.body,
  },
});
