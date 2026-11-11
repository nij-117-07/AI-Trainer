// src/features/motivation/components/QuoteTab.tsx
/** Motivational Quote: a quote matched to the user's feeling, its persona, and one micro-action. */
import { StyleSheet, Text, View } from "react-native";
import { Quote, RefreshCw, SlidersHorizontal, Target } from "lucide-react-native";
import { spacing, typeScale, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Disclosure } from "@/components/tool/Disclosure";
import { SelectField } from "@/components/tool/SelectField";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ListenButton } from "@/components/tool/ListenButton";
import { CopyButton } from "@/components/tool/CopyButton";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { parseInline } from "@/lib/markdown";
import { useRequest } from "@/hooks/useRequest";
import { generateQuote } from "../lib/generators";
import { QUOTE_DEFAULTS, QUOTE_DRAFT_KEY, restoreQuoteDraft } from "../lib/drafts";
import { quoteStyleOptions } from "../lib/options";
import { isQuoteStyleChoice, type QuoteFormValues, type QuoteResult } from "../lib/types";
import { useDraft } from "../hooks/useDraft";

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
  const { form, pending, update } = state;
  const styleLabel = quoteStyleOptions.find((option) => option.value === form.quoteType)?.label ?? "";
  const summary = [styleLabel, form.userFeeling].filter(Boolean).join(" · ");

  return (
    <Disclosure title="Quote options" icon={SlidersHorizontal} summary={summary || undefined}>
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
    </Disclosure>
  );
}

export function QuoteFooter({ state }: { state: QuoteTabState }) {
  const { pending, error, generate } = state;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Finding a quote…" : "New quote"}
        icon={RefreshCw}
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
    return <EmptyHint icon={Quote} title="No quote yet" hint="Tap New quote to get one." />;
  }

  const attribution = [result.authorPersona && `— ${result.authorPersona}`, result.currentDate]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <>
      <Panel>
        <View style={styles.quoteBlock}>
          <Text style={[styles.quote, { color: colors.foreground }]}>
            {parseInline(result.quote).map((segment, index) => (
              <Text key={index} style={[segment.bold && styles.bold, segment.italic && styles.italic]}>
                {segment.text}
              </Text>
            ))}
          </Text>
          {attribution !== "" && (
            <Text style={[typeScale.caption, { color: colors.mutedForeground }]}>{attribution}</Text>
          )}
        </View>
        <View style={styles.actions}>
          <CopyButton text={result.quote} label="Copy quote" />
          <ListenButton text={result.quote} label="Quote" />
        </View>
      </Panel>
      <Disclosure title="Actionable insight" icon={Target}>
        <MarkdownText content={result.actionableInsight} />
        <ListenButton text={result.actionableInsight} label="Actionable insight" />
      </Disclosure>
    </>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.sm,
  },
  compactInput: {
    minHeight: 72,
  },
  quoteBlock: {
    gap: spacing.sm,
  },
  quote: {
    ...typeScale.headline,
  },
  bold: {
    fontWeight: "700",
  },
  italic: {
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
});
