// src/features/conceptual-bridge/components/ConceptualBridgeTab.tsx
/**
 * Conceptual Bridge: links two unrelated concepts through a structural analogy, a narrative,
 * and a question to think about. The form and the last result are kept on the device.
 */
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BookOpen, Brain, Lightbulb, Link2, RefreshCcw, Sparkles } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Field, Panel, ChoiceChips, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { ListenButton } from "@/components/tool/ListenButton";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { abstractionDepthOptions } from "../options";
import { generateBridge } from "../lib/generators";
import { BRIDGE_DRAFT_KEY, DEFAULT_BRIDGE_FORM, normalizeDraft } from "../lib/draft";
import type { BridgeFormValues, BridgeResult } from "../types";

export function ConceptualBridgeTab() {
  const colors = useThemeColors();
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

  return (
    <Section>
      <Panel>
        <TextField
          label="Concept A"
          placeholder="e.g. Photosynthesis"
          value={form.conceptA}
          onChangeText={(text) => update({ conceptA: text })}
          editable={!request.pending}
          maxLength={200}
        />
        <TextField
          label="Concept B"
          placeholder="e.g. Blockchain"
          value={form.conceptB}
          onChangeText={(text) => update({ conceptB: text })}
          editable={!request.pending}
          maxLength={200}
        />
        <Field label="Abstraction depth">
          <ChoiceChips
            options={abstractionDepthOptions}
            value={form.abstractionDepth}
            onChange={(value) => update({ abstractionDepth: value })}
          />
        </Field>
        <ActionButton
          label={request.pending ? "Connecting concepts…" : "Build the bridge"}
          icon={Sparkles}
          loading={request.pending}
          onPress={submit}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result && (
        <>
          <Panel>
            <SectionTitle icon={Brain} title="Cognitive flexibility" />
            <View style={styles.scoreRow}>
              <View style={[styles.track, { backgroundColor: colors.muted }]}>
                <View
                  style={[
                    styles.fill,
                    { backgroundColor: colors.primary, width: `${(result.cognitiveFlexibilityScore / 5) * 100}%` },
                  ]}
                />
              </View>
              <Text style={[styles.scoreText, { color: colors.foreground }]}>
                {result.cognitiveFlexibilityScore} / 5
              </Text>
            </View>
          </Panel>

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
        </>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={reset} />
    </Section>
  );
}

const styles = StyleSheet.create({
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
