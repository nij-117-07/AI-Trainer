/** Prompt Refiner: paste a rough prompt, add an optional goal and constraints, and get a clearer version. */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { HelpCircle, ListChecks, RefreshCcw, Sparkles, Wand2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { CopyButton } from "@/components/tool/CopyButton";
import { ListenButton } from "@/components/tool/ListenButton";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { useRequest } from "@/hooks/useRequest";
import { refinePrompt } from "../lib/generators";
import { GOAL_MAX, ORIGINAL_MAX, PROMPT_MAX } from "../lib/validate";
import type { PromptRefinerFormValues, PromptRefinerResult } from "../types";

const DEFAULTS: PromptRefinerFormValues = { originalPrompt: "", goal: "", constraints: "" };

export function PromptRefinerTool() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const request = useRequest(refinePrompt);
  const [form, setForm] = useState<PromptRefinerFormValues>(DEFAULTS);

  const update = <K extends keyof PromptRefinerFormValues>(key: K, value: PromptRefinerFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  function reset() {
    setForm(DEFAULTS);
    request.reset();
  }

  const result: PromptRefinerResult | null = request.data;

  return (
    <Section>
      <Panel>
        <TextField
          label="Your prompt"
          placeholder="e.g. write something about our new app for social media"
          value={form.originalPrompt}
          onChangeText={(text) => update("originalPrompt", text)}
          editable={!request.pending}
          multiline
          maxLength={ORIGINAL_MAX}
          voice
        />
        <TextField
          label="Goal (optional)"
          placeholder="What should the AI produce?"
          value={form.goal}
          onChangeText={(text) => update("goal", text)}
          editable={!request.pending}
          maxLength={GOAL_MAX}
        />
        <TextField
          label="Constraints (optional)"
          placeholder="e.g. under 100 words, bullet points, friendly tone"
          value={form.constraints}
          onChangeText={(text) => update("constraints", text)}
          editable={!request.pending}
          maxLength={PROMPT_MAX}
        />
        <ActionButton
          label={request.pending ? "Refining…" : "Refine prompt"}
          icon={Sparkles}
          loading={request.pending}
          onPress={() => request.run(settings, form)}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result && (
        <>
          <SectionTitle icon={Wand2} title="Refined prompt" />
          <Panel>
            <View style={[styles.promptBox, { borderColor: colors.border, backgroundColor: colors.background }]}>
              <Text selectable style={[styles.prompt, { color: colors.foreground }]}>
                {result.refinedPrompt || "No refined prompt was returned."}
              </Text>
            </View>
            {result.refinedPrompt.trim() !== "" && (
              <View style={styles.actions}>
                <CopyButton text={result.refinedPrompt} label="Copy prompt" />
                <ListenButton text={result.refinedPrompt} label="Refined prompt" />
              </View>
            )}
          </Panel>

          {result.changes.length > 0 && (
            <ResultCallout icon={ListChecks} title="What changed" tone="emerald">
              {result.changes.map((change, index) => (
                <Text key={index} style={[styles.item, { color: colors.foreground }]}>
                  • {change}
                </Text>
              ))}
            </ResultCallout>
          )}

          {result.clarifyingQuestions.length > 0 && (
            <ResultCallout icon={HelpCircle} title="Questions to sharpen it" tone="sky">
              {result.clarifyingQuestions.map((question, index) => (
                <Text key={index} style={[styles.item, { color: colors.foreground }]}>
                  • {question}
                </Text>
              ))}
            </ResultCallout>
          )}
        </>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={reset} />
    </Section>
  );
}

const styles = StyleSheet.create({
  promptBox: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md },
  prompt: { fontSize: 15, lineHeight: 23 },
  actions: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  item: { fontSize: 14, lineHeight: 21 },
});
