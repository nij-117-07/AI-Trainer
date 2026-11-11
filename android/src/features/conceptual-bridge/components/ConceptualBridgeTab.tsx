// src/features/conceptual-bridge/components/ConceptualBridgeTab.tsx
/**
 * Conceptual Bridge: links two unrelated concepts through a structural analogy, a narrative,
 * and a question to think about. Two pages: the form, then the result. The last result is kept on the device.
 */
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BookOpen, Brain, Lightbulb, Link2, Plus, Sparkles } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { ListenButton } from "@/components/tool/ListenButton";
import { CopyButton } from "@/components/tool/CopyButton";
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
  startNew: () => void;
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

  function startNew() {
    setResult(null);
    request.reset();
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
    startNew,
    reset,
  };
}

/** Page one: the form. Shown while there is no result. */
export function ConceptualBridgeForm({ bridge }: { bridge: ConceptualBridgeState }) {
  const { form, pending, update } = bridge;

  return (
    <Section>
      <TextField
        label="New idea"
        placeholder="e.g. Blockchain"
        value={form.conceptA}
        onChangeText={(text) => update({ conceptA: text })}
        editable={!pending}
        maxLength={200}
      />
      <TextField
        label="Something you already know"
        placeholder="e.g. Photosynthesis"
        value={form.conceptB}
        onChangeText={(text) => update({ conceptB: text })}
        editable={!pending}
        maxLength={200}
      />
      <TextField
        label="Instructions (optional)"
        placeholder="e.g. Use a kitchen analogy, or keep it under 3 sentences"
        value={form.customUserInput}
        onChangeText={(text) => update({ customUserInput: text })}
        editable={!pending}
        maxLength={CUSTOM_INPUT_MAX}
        multiline
        voice
        style={styles.compactInput}
      />
    </Section>
  );
}

/** Page two: the result. Shown once a bridge has been built. */
export function ConceptualBridgeResults({ bridge }: { bridge: ConceptualBridgeState }) {
  const { form, result } = bridge;

  if (!result) return null;

  return (
    <Section>
      <ConnectionHeader conceptA={form.conceptA.trim()} conceptB={form.conceptB.trim()} />

      <ResultCallout icon={Link2} title="Structural analogy" tone="sky">
        <MarkdownText content={result.structuralAnalogy} />
        <ResultActions text={result.structuralAnalogy} label="structural analogy" />
      </ResultCallout>

      <View style={styles.part}>
        <SectionTitle icon={BookOpen} title="Bridging narrative" />
        <MarkdownText content={result.bridgingNarrative} />
        <ResultActions text={result.bridgingNarrative} label="bridging narrative" />
      </View>

      <ResultCallout icon={Lightbulb} title="Think about this" tone="amber">
        <MarkdownText content={result.insightQuestion} />
        <ResultActions text={result.insightQuestion} label="question" />
      </ResultCallout>

      <FlexibilityScore score={result.cognitiveFlexibilityScore} />
    </Section>
  );
}

/** Footer action for the current page: "Build bridge" on the form, "New bridge" on the result. */
export function ConceptualBridgeFooter({ bridge }: { bridge: ConceptualBridgeState }) {
  const { result, pending, error, submit, startNew } = bridge;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      {result ? (
        <ActionButton label="New bridge" icon={Plus} onPress={startNew} />
      ) : (
        <ActionButton
          label={pending ? "Building bridge…" : "Build bridge"}
          icon={Sparkles}
          loading={pending}
          onPress={submit}
        />
      )}
    </View>
  );
}

function ResultActions({ text, label }: { text: string; label: string }) {
  return (
    <View style={styles.actions}>
      <View style={styles.listen}>
        <ListenButton text={text} label={label} />
      </View>
      <CopyButton text={text} label={`Copy ${label}`} />
    </View>
  );
}

function ConnectionHeader({ conceptA, conceptB }: { conceptA: string; conceptB: string }) {
  const colors = useThemeColors();
  return (
    <View style={styles.connection}>
      <Text style={[styles.concept, { color: colors.foreground }]} numberOfLines={2}>
        {conceptA || "New idea"}
      </Text>
      <View style={[styles.linkBadge, { backgroundColor: colors.muted }]}>
        <Link2 size={18} color={colors.primary} />
      </View>
      <Text style={[styles.concept, { color: colors.foreground }]} numberOfLines={2}>
        {conceptB || "Something you already know"}
      </Text>
    </View>
  );
}

function FlexibilityScore({ score }: { score: number }) {
  const colors = useThemeColors();
  return (
    <Panel>
      <SectionTitle icon={Brain} title="Cognitive flexibility" />
      <View style={styles.scoreRow}>
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Cognitive flexibility"
          accessibilityValue={{ min: 0, max: 5, now: score }}
          style={[styles.track, { backgroundColor: colors.muted }]}
        >
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
  compactInput: {
    minHeight: 72,
  },
  part: {
    gap: spacing.md,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  listen: {
    flex: 1,
  },
  connection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  concept: {
    flex: 1,
    ...typeScale.title,
    fontWeight: "600",
    textAlign: "center",
  },
  linkBadge: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.md,
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
    borderRadius: shape.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
  scoreText: {
    ...typeScale.label,
    fontWeight: "600",
    minWidth: touchTarget,
    textAlign: "right",
  },
});
