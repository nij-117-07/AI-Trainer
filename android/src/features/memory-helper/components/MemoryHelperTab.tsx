// src/features/memory-helper/components/MemoryHelperTab.tsx
/** Memory Helper: a why-it-works note, concept-to-hook mnemonics, and a 3-step retention plan. The form sits in the footer. */
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Brain, Lightbulb, ListChecks, Sparkles } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { ListenButton } from "@/components/tool/ListenButton";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { MemoryHelperState } from "../hooks/useMemoryHelper";
import { techniqueOptions } from "../lib/options";
import { CONTENT_MAX, CONTENT_MIN, isMemoryTechnique } from "../lib/types";

export function MemoryHelperResults({ state }: { state: MemoryHelperState }) {
  const colors = useThemeColors();
  const { result } = state;

  if (!result) {
    return (
      <EmptyHint
        icon={Brain}
        title="Turn facts into memory aids"
        hint="Paste what you need to remember in the form, then tap Create mnemonics."
      />
    );
  }

  return (
    <Section>
      {result.explanation.trim() !== "" && (
        <ResultCallout icon={Lightbulb} title="Why this technique works" tone="sky">
          <MarkdownText content={result.explanation} />
          <ListenButton text={result.explanation} label="Explanation" />
        </ResultCallout>
      )}

      <Panel>
        <SectionTitle icon={Brain} title="Memory hooks" />
        {result.memoryHooks.length === 0 ? (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>No memory hooks returned. Try again.</Text>
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
    </Section>
  );
}

export function MemoryHelperFooter({ state }: { state: MemoryHelperState }) {
  const { form, pending, error, update, submit } = state;

  return (
    <View style={styles.footer}>
      <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent} keyboardShouldPersistTaps="handled">
        <TextField
          label="Facts to memorize"
          placeholder="e.g. The planets in order from the sun, or the steps of the Krebs cycle"
          hint={`At least ${CONTENT_MIN} characters.`}
          value={form.topic}
          onChangeText={(text) => update("topic", text)}
          editable={!pending}
          maxLength={CONTENT_MAX}
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
      </ScrollView>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Building memory hooks…" : "Create mnemonics"}
        icon={Sparkles}
        loading={pending}
        onPress={submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  fields: {
    maxHeight: 340,
  },
  fieldsContent: {
    gap: spacing.md,
  },
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
