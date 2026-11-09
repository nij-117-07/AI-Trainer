// src/features/memory-helper/components/MemoryHelperTab.tsx
/** Memory Helper: a why-it-works note, concept-to-hook mnemonics, and a 3-step retention plan. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Brain, Lightbulb, ListChecks, RefreshCcw, Sparkles } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { ListenButton } from "@/components/tool/ListenButton";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { generateMemoryAids } from "../lib/generators";
import { MEMORY_DEFAULTS, MEMORY_DRAFT_KEY, restoreMemoryDraft } from "../lib/drafts";
import { techniqueOptions } from "../lib/options";
import { isMemoryTechnique, type MemoryFormValues, type MemoryResult } from "../lib/types";
import { useDraft } from "../hooks/useDraft";

export function MemoryHelperTab() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const draft = useDraft<MemoryFormValues, MemoryResult>(MEMORY_DRAFT_KEY, MEMORY_DEFAULTS, restoreMemoryDraft);
  const request = useRequest(generateMemoryAids);
  const { form, result } = draft;

  function update<K extends keyof MemoryFormValues>(key: K, value: MemoryFormValues[K]) {
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
          label="Facts or data to memorize"
          placeholder="Paste the facts, terms, or list you need to remember…"
          hint="At least 5 characters."
          value={form.topic}
          onChangeText={(text) => update("topic", text)}
          editable={!request.pending}
          maxLength={2000}
          multiline
          voice
        />
        <SelectField
          label="Mnemonic technique"
          options={techniqueOptions}
          value={form.technique}
          onChange={(value) => {
            if (isMemoryTechnique(value)) update("technique", value);
          }}
          allowCustom={false}
        />
        <ActionButton
          label={request.pending ? "Building memory hooks…" : "Create mnemonics"}
          icon={Sparkles}
          loading={request.pending}
          onPress={handleGenerate}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result && (
        <>
          {result.explanation.trim() !== "" && (
            <ResultCallout icon={Lightbulb} title="Why this technique works" tone="sky">
              <MarkdownText content={result.explanation} />
              <ListenButton text={result.explanation} label="Explanation" />
            </ResultCallout>
          )}

          <Panel>
            <SectionTitle icon={Brain} title="Memory hooks" />
            {result.memoryHooks.length === 0 ? (
              <Text style={[styles.empty, { color: colors.mutedForeground }]}>No memory hooks returned.</Text>
            ) : (
              <View style={styles.hooks}>
                {result.memoryHooks.map((item, index) => (
                  <View key={`${item.concept}-${index}`} style={[styles.hook, { borderColor: colors.border }]}>
                    <Text style={[styles.hookConcept, { color: colors.primary }]}>
                      {index + 1}. {item.concept}
                    </Text>
                    <MarkdownText content={item.hook} />
                    <ListenButton text={item.hook} label="Memory hook" />
                  </View>
                ))}
              </View>
            )}
          </Panel>

          {result.retentionPlan.trim() !== "" && (
            <ResultCallout icon={ListChecks} title="Retention plan" tone="emerald">
              <MarkdownText content={result.retentionPlan} />
              <ListenButton text={result.retentionPlan} label="Retention plan" />
            </ResultCallout>
          )}
        </>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={reset} />
    </Section>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 14,
  },
  hooks: {
    gap: spacing.md,
  },
  hook: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  hookConcept: {
    fontSize: 15,
    fontWeight: "600",
  },
});
