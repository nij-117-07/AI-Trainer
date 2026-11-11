// src/features/motivation/components/QuoteTab.tsx
/** Motivational Quote: a quote matched to the user's feeling, its persona, and one micro-action. */
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Quote, Sparkles, Target } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { ListenButton } from "@/components/tool/ListenButton";
import { useRequest } from "@/hooks/useRequest";
import { generateQuote } from "../lib/generators";
import { QUOTE_DEFAULTS, QUOTE_DRAFT_KEY, restoreQuoteDraft } from "../lib/drafts";
import { quoteStyleOptions } from "../lib/options";
import { isQuoteStyleChoice, type QuoteFormValues, type QuoteResult } from "../lib/types";
import { useDraft } from "../hooks/useDraft";
import { EmptyHint } from "@/components/tool/EmptyHint";

export function useQuoteTab() {
  const { settings } = useAiSettings();
  const draft = useDraft<QuoteFormValues, QuoteResult>(QUOTE_DRAFT_KEY, QUOTE_DEFAULTS, restoreQuoteDraft);
  const request = useRequest(generateQuote);

  function update<K extends keyof QuoteFormValues>(key: K, value: QuoteFormValues[K]) {
    draft.setForm((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    draft.reset();
    request.reset();
  }

  async function generate() {
    const generated = await request.run(settings, draft.form);
    if (generated) draft.setResult(generated);
  }

  return {
    form: draft.form,
    result: draft.result,
    pending: request.pending,
    error: request.error,
    update,
    generate,
    reset,
  };
}

export type QuoteTabState = ReturnType<typeof useQuoteTab>;

export function QuoteForm({ state }: { state: QuoteTabState }) {
  const { form, pending, error, update, generate } = state;

  return (
    <View style={styles.form}>
      <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent} keyboardShouldPersistTaps="handled">
        <TextField
          label="Seed topic (optional)"
          placeholder="e.g. Resilience"
          value={form.seedTopic}
          onChangeText={(text) => update("seedTopic", text)}
          editable={!pending}
          maxLength={200}
        />
        <SelectField
          label="Quote style"
          options={quoteStyleOptions}
          value={form.quoteType}
          onChange={(value) => {
            if (isQuoteStyleChoice(value)) update("quoteType", value);
          }}
          allowCustom={false}
        />
        <TextField
          label="How you're feeling (optional)"
          placeholder="e.g. I feel overwhelmed"
          value={form.userFeeling}
          onChangeText={(text) => update("userFeeling", text)}
          editable={!pending}
          maxLength={500}
          multiline
          voice
          style={styles.compactInput}
        />
      </ScrollView>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Crafting your quote…" : "Generate quote"}
        icon={Sparkles}
        loading={pending}
        onPress={generate}
      />
    </View>
  );
}

export function QuoteResults({ state }: { state: QuoteTabState }) {
  const colors = useThemeColors();
  const { result } = state;

  if (!result) {
    return (
      <EmptyHint
        icon={Quote}
        title="Your daily quote"
        hint="Choose a style and tell us how you feel in the form, then tap Generate quote."
      />
    );
  }

  return (
    <>
      <ResultCallout icon={Quote} title="Your quote" tone="amber">
        <MarkdownText content={result.quote} />
        {(result.authorPersona || result.currentDate) && (
          <Text style={[styles.attribution, { color: colors.mutedForeground }]}>
            {[result.authorPersona && `— ${result.authorPersona}`, result.currentDate].filter(Boolean).join("  ·  ")}
          </Text>
        )}
        <ListenButton text={result.quote} label="Quote" />
      </ResultCallout>
      <ResultCallout icon={Target} title="Actionable insight" tone="emerald">
        <MarkdownText content={result.actionableInsight} />
        <ListenButton text={result.actionableInsight} label="Actionable insight" />
      </ResultCallout>
    </>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  fields: {
    maxHeight: 320,
  },
  fieldsContent: {
    gap: spacing.md,
  },
  compactInput: {
    minHeight: 72,
  },
  attribution: {
    fontSize: 13,
    lineHeight: 19,
    fontStyle: "italic",
    marginTop: spacing.xs,
  },
});
