// src/features/conceptual-bridge/components/ConceptualBridgeTab.tsx
/**
 * Conceptual Bridge: links two unrelated concepts through a structural analogy, a narrative,
 * and a question to think about. The form sits in the footer; the last result is kept on the device.
 */
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { BookOpen, Brain, Lightbulb, Link2, Sparkles } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { ListenButton } from "@/components/tool/ListenButton";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { generateBridge } from "../lib/generators";
import { BRIDGE_DRAFT_KEY, DEFAULT_BRIDGE_FORM, normalizeDraft } from "../lib/draft";
import type { BridgeFormValues, BridgeResult } from "../types";

const CUSTOM_INPUT_MAX = 1000;

export interface ConceptualBridgeState {
  form: BridgeFormValues;
  result: BridgeResult | null;
  pending: boolean;
  error: string | null;
  update: (patch: Partial<BridgeFormValues>) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useConceptualBridge(): ConceptualBridgeState {
  const { settings } = useAiSettings();
  const [form, setForm] = useState<BridgeFormValues>(DEFAULT_BRIDGE_FORM);
  const [result, setResult] = useState<BridgeResult | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const request = useRequest(generateBridge);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(BRIDGE_DRAFT_KEY, null)
      .then((raw) => {
        if (!active) return;
        const draft = normalizeDraft(raw);
        setForm(draft.form);
        setResult(draft.result);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveDocument(BRIDGE_DRAFT_KEY, { form, result }).catch(() => undefined);
  }, [hydrated, form, result]);

  function update(patch: Partial<BridgeFormValues>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  async function submit() {
    const next = await request.run(settings, form);
    if (next) setResult(next);
  }

  function reset() {
    setForm(DEFAULT_BRIDGE_FORM);
    setResult(null);
    request.reset();
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

export function ConceptualBridgeResults({ bridge }: { bridge: ConceptualBridgeState }) {
  const { form, result } = bridge;

  if (!result) {
    return (
      <EmptyHint
        icon={Link2}
        title="Build a bridge"
        hint="Enter two unrelated concepts in the form below, then tap Build the bridge to see how they connect."
      />
    );
  }

  return (
    <Section>
      <ConnectionHeader conceptA={form.conceptA.trim()} conceptB={form.conceptB.trim()} />
      <FlexibilityScore score={result.cognitiveFlexibilityScore} />

      <Panel>
        <SectionTitle icon={Link2} title="Structural analogy" />
        <MarkdownText content={result.structuralAnalogy} />
        <ListenButton text={result.structuralAnalogy} label="Structural analogy" />
      </Panel>

      <Panel>
        <SectionTitle icon={BookOpen} title="Bridging narrative" />
        <MarkdownText content={result.bridgingNarrative} />
        <ListenButton text={result.bridgingNarrative} label="Bridging narrative" />
      </Panel>

      <ResultCallout icon={Lightbulb} title="Think about this" tone="amber">
        <MarkdownText content={result.insightQuestion} />
        <ListenButton text={result.insightQuestion} label="Question" />
      </ResultCallout>
    </Section>
  );
}

export function ConceptualBridgeFooter({ bridge }: { bridge: ConceptualBridgeState }) {
  const { form, pending, error, update, submit } = bridge;

  return (
    <View style={styles.footer}>
      <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent} keyboardShouldPersistTaps="handled">
        <TextField
          label="Concept A"
          placeholder="e.g. Photosynthesis"
          value={form.conceptA}
          onChangeText={(text) => update({ conceptA: text })}
          editable={!pending}
          maxLength={200}
        />
        <TextField
          label="Concept B"
          placeholder="e.g. Blockchain"
          value={form.conceptB}
          onChangeText={(text) => update({ conceptB: text })}
          editable={!pending}
          maxLength={200}
        />
        <TextField
          label="Custom input (optional)"
          placeholder="e.g. Use a kitchen analogy, or keep it under 3 sentences"
          value={form.customUserInput}
          onChangeText={(text) => update({ customUserInput: text })}
          editable={!pending}
          maxLength={CUSTOM_INPUT_MAX}
          multiline
          voice
          style={styles.compactInput}
        />
      </ScrollView>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Connecting concepts…" : "Build the bridge"}
        icon={Sparkles}
        loading={pending}
        onPress={submit}
      />
    </View>
  );
}

function ConnectionHeader({ conceptA, conceptB }: { conceptA: string; conceptB: string }) {
  const colors = useThemeColors();
  return (
    <Panel>
      <View style={styles.connection}>
        <Text style={[styles.concept, { color: colors.foreground }]} numberOfLines={2}>
          {conceptA || "Concept A"}
        </Text>
        <View style={[styles.linkBadge, { backgroundColor: colors.muted }]}>
          <Link2 size={18} color={colors.primary} />
        </View>
        <Text style={[styles.concept, { color: colors.foreground }]} numberOfLines={2}>
          {conceptB || "Concept B"}
        </Text>
      </View>
    </Panel>
  );
}

function FlexibilityScore({ score }: { score: number }) {
  const colors = useThemeColors();
  return (
    <Panel>
      <SectionTitle icon={Brain} title="Cognitive flexibility" />
      <View style={styles.scoreRow}>
        <View style={[styles.track, { backgroundColor: colors.muted }]}>
          <View style={[styles.fill, { backgroundColor: colors.primary, width: `${(score / 5) * 100}%` }]} />
        </View>
        <Text style={[styles.scoreText, { color: colors.foreground }]}>{score} / 5</Text>
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  fields: {
    maxHeight: 380,
  },
  fieldsContent: {
    gap: spacing.md,
  },
  compactInput: {
    minHeight: 72,
  },
  connection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  concept: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  linkBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.full / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
  scoreText: {
    fontSize: 15,
    fontWeight: "700",
    minWidth: 48,
    textAlign: "right",
  },
});
