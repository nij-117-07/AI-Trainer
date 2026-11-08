// src/features/motivation/components/QuoteTab.tsx
/** Motivational Quote: a quote matched to the user's feeling, its persona, and one micro-action. */
import { StyleSheet, Text } from "react-native";
import { Quote, RefreshCcw, Sparkles, Target } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { useRequest } from "@/hooks/useRequest";
import { generateQuote } from "../lib/generators";
import { QUOTE_DEFAULTS, QUOTE_DRAFT_KEY, restoreQuoteDraft } from "../lib/drafts";
import { quoteStyleOptions } from "../lib/options";
import { isQuoteType, type QuoteFormValues, type QuoteResult } from "../lib/types";
import { useDraft } from "../hooks/useDraft";

export function QuoteTab() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const draft = useDraft<QuoteFormValues, QuoteResult>(
    QUOTE_DRAFT_KEY,
    QUOTE_DEFAULTS,
    restoreQuoteDraft,
  );
  const request = useRequest(generateQuote);
  const { form, result } = draft;

  function update<K extends keyof QuoteFormValues>(key: K, value: QuoteFormValues[K]) {
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
          label="Seed topic"
          placeholder="e.g. Resilience"
          value={form.seedTopic}
          onChangeText={(text) => update("seedTopic", text)}
          editable={!request.pending}
          maxLength={200}
        />
        <SelectField
          label="Quote style"
          options={quoteStyleOptions}
          value={form.quoteType}
          onChange={(value) => {
            if (isQuoteType(value)) update("quoteType", value);
          }}
          allowCustom={false}
        />
        <TextField
          label="How you're feeling"
          placeholder="e.g. I feel overwhelmed."
          value={form.userFeeling}
          onChangeText={(text) => update("userFeeling", text)}
          editable={!request.pending}
          maxLength={500}
          multiline
        />
        <ActionButton
          label={request.pending ? "Crafting your quote…" : "Generate quote"}
          icon={Sparkles}
          loading={request.pending}
          onPress={handleGenerate}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result && (
        <>
          <ResultCallout icon={Quote} title="Your quote" tone="amber">
            <MarkdownText content={result.quote} />
            {(result.authorPersona || result.currentDate) && (
              <Text style={[styles.attribution, { color: colors.mutedForeground }]}>
                {[result.authorPersona && `— ${result.authorPersona}`, result.currentDate].filter(Boolean).join("  ·  ")}
              </Text>
            )}
          </ResultCallout>
          <ResultCallout icon={Target} title="Actionable insight" tone="emerald">
            <MarkdownText content={result.actionableInsight} />
          </ResultCallout>
        </>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={reset} />
    </Section>
  );
}

const styles = StyleSheet.create({
  attribution: {
    fontSize: 13,
    lineHeight: 19,
    fontStyle: "italic",
    marginTop: spacing.xs,
  },
});
