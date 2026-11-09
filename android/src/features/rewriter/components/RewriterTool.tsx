// src/features/rewriter/components/RewriterTool.tsx
/** Rewriter: rewrites text for a tone, audience, and goal, with the rationale and the changes made. */
import { useEffect, useRef } from "react";
import { StyleSheet, Text } from "react-native";
import {
  Lightbulb,
  ListChecks,
  PenLine,
  RefreshCcw,
} from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import {
  ActionButton,
  ErrorText,
  Panel,
  TextField,
} from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { rewriteText } from "../lib/generators";
import { REWRITER_STORAGE_KEY } from "../lib/persistence";
import { TRANSFORMATION_GOAL_OPTIONS } from "../options";
import { usePersistedDraft } from "../hooks/usePersistedDraft";
import type { RewriteFormValues, RewriteResult } from "../types";

const DEFAULTS: RewriteFormValues = {
  originalText: "This product is really good and works well.",
  targetTone: "witty",
  audience: "software engineers",
  transformationGoal: "paraphrase",
  customInstructions: "",
};

function quote(text: string): string {
  return text
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
}

export function RewriterTool() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const { form, setForm, result, setResult, reset } = usePersistedDraft<
    RewriteFormValues,
    RewriteResult
  >(REWRITER_STORAGE_KEY, DEFAULTS);
  const request = useRequest(rewriteText);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  function update<K extends keyof RewriteFormValues>(
    key: K,
    value: RewriteFormValues[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    controllerRef.current?.abort();
    reset();
    request.reset();
  }

  async function handleRewrite() {
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
        <TextField
          label="Original text"
          placeholder="Paste the text you want to rewrite…"
          value={form.originalText}
          onChangeText={(text) => update("originalText", text)}
          editable={!request.pending}
          maxLength={10000}
          multiline
          voice
        />
        <TextField
          label="Target tone"
          placeholder="e.g. witty, professional, warm"
          value={form.targetTone}
          onChangeText={(text) => update("targetTone", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <TextField
          label="Audience"
          placeholder="e.g. software engineers, investors"
          value={form.audience}
          onChangeText={(text) => update("audience", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <SelectField
          label="Transformation goal"
          options={TRANSFORMATION_GOAL_OPTIONS}
          value={form.transformationGoal}
          onChange={(value) => update("transformationGoal", value)}
          allowCustom={false}
        />
        <TextField
          label="Custom instructions (optional)"
          placeholder="e.g. keep it under 15 words…"
          hint="Specific constraints or rules."
          value={form.customInstructions}
          onChangeText={(text) => update("customInstructions", text)}
          editable={!request.pending}
          maxLength={1000}
          multiline
          voice
        />
        <ActionButton
          label={request.pending ? "Rewriting…" : "Rewrite"}
          icon={PenLine}
          loading={request.pending}
          onPress={handleRewrite}
        />
      </Panel>

      <ErrorText message={cancelled ? null : request.error} />

      {result && (
        <>
          <ResultCallout icon={PenLine} title="Rewritten text" tone="emerald">
            <MarkdownText
              content={
                result.rewrittenText
                  ? quote(result.rewrittenText)
                  : "_No rewrite was returned._"
              }
            />
            <ListenButton text={result.rewrittenText} label="Rewrite" />
          </ResultCallout>

          {result.rationale !== "" && (
            <ResultCallout icon={Lightbulb} title="Rationale" tone="sky">
              <MarkdownText content={result.rationale} />
              <ListenButton text={result.rationale} label="Rationale" />
            </ResultCallout>
          )}

          <SectionTitle icon={ListChecks} title="Improvements made" />
          <Panel>
            {result.improvementsMade.length === 0 ? (
              <Text style={[styles.empty, { color: colors.mutedForeground }]}>
                No improvements were listed.
              </Text>
            ) : (
              <MarkdownText
                content={result.improvementsMade
                  .map((item) => `- ${item}`)
                  .join("\n")}
              />
            )}
          </Panel>
        </>
      )}

      <ActionButton
        label="Reset"
        icon={RefreshCcw}
        variant="outline"
        onPress={handleReset}
      />
    </Section>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
});
