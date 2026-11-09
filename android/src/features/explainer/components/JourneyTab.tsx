// src/features/explainer/components/JourneyTab.tsx
/**
 * Orchestrated Journey: builds a chapter plan, then explains each chapter in turn. Chapters
 * appear as they finish. Stop ends the journey after the current chapter and keeps what is done.
 */
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Check, CircleDot, Compass, Loader2, MapPin, RefreshCcw, Square } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { runJourney } from "../lib/generators";
import type { JourneyChapter, JourneyFormValues, JourneyPlan } from "../types";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { ListenButton } from "@/components/tool/ListenButton";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { TagList } from "@/components/tool/TagList";

type JourneyStatus = "idle" | "streaming" | "done" | "stopped" | "error";

interface JourneyState {
  status: JourneyStatus;
  plan: JourneyPlan | null;
  chapters: JourneyChapter[];
  error: string | null;
}

const IDLE_STATE: JourneyState = { status: "idle", plan: null, chapters: [], error: null };

const DEFAULTS: JourneyFormValues = {
  topic: "Calculus",
  expertise: "Undergraduate",
};

export function JourneyTab() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const [form, setForm] = useState<JourneyFormValues>(DEFAULTS);
  const [state, setState] = useState<JourneyState>(IDLE_STATE);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const streaming = state.status === "streaming";
  const titles = state.plan?.titles ?? [];

  async function start() {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState({ ...IDLE_STATE, status: "streaming" });

    const isCurrent = () => controllerRef.current === controller;

    try {
      await runJourney(
        settings,
        form,
        {
          onPlan: (plan) => {
            if (isCurrent()) setState((prev) => ({ ...prev, plan }));
          },
          onChapter: (chapter) => {
            if (isCurrent()) setState((prev) => ({ ...prev, chapters: [...prev.chapters, chapter] }));
          },
        },
        controller.signal,
      );
      if (!isCurrent()) return;
      setState((prev) => ({ ...prev, status: controller.signal.aborted ? "stopped" : "done" }));
    } catch (err) {
      if (!isCurrent()) return;
      if (controller.signal.aborted) {
        setState((prev) => ({ ...prev, status: prev.chapters.length > 0 ? "stopped" : "idle" }));
        return;
      }
      setState((prev) => ({
        ...prev,
        status: "error",
        error: err instanceof Error ? err.message : "The journey stopped unexpectedly. Please try again.",
      }));
    }
  }

  function stop() {
    controllerRef.current?.abort();
  }

  function reset() {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setForm(DEFAULTS);
    setState(IDLE_STATE);
  }

  function clearResults() {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setState(IDLE_STATE);
  }

  const progress = titles.length > 0 ? Math.min(1, state.chapters.length / titles.length) : 0;

  return (
    <Section>
      <Panel>
        <TextField
          label="Topic"
          placeholder="e.g. Calculus"
          value={form.topic}
          onChangeText={(text) => setForm((prev) => ({ ...prev, topic: text }))}
          editable={!streaming}
          maxLength={200}
        />
        <TextField
          label="Expertise / depth"
          placeholder="e.g. Undergraduate, PhD, Hobbyist"
          value={form.expertise}
          onChangeText={(text) => setForm((prev) => ({ ...prev, expertise: text }))}
          editable={!streaming}
          maxLength={80}
        />
        {streaming ? (
          <ActionButton label="Stop" icon={Square} variant="outline" onPress={stop} />
        ) : (
          <ActionButton label="Start journey" icon={Compass} onPress={start} />
        )}
      </Panel>

      <ErrorText message={state.error} />

      {state.status === "streaming" && (
        <Panel>
          <View style={styles.statusRow}>
            <Loader2 size={16} color={colors.primary} />
            <Text style={[styles.statusText, { color: colors.foreground }]}>Generating journey…</Text>
          </View>
          {titles.length > 0 && (
            <>
              <View style={[styles.track, { backgroundColor: colors.muted }]}>
                <View style={[styles.fill, { backgroundColor: colors.primary, width: `${progress * 100}%` }]} />
              </View>
              <Text style={[styles.count, { color: colors.mutedForeground }]}>
                {state.chapters.length} / {titles.length} chapters
              </Text>
            </>
          )}
        </Panel>
      )}

      {state.status === "done" && (
        <ResultCallout icon={Check} title="Journey complete" tone="emerald">
          <Text style={[styles.statusText, { color: colors.foreground }]}>All chapters are ready below.</Text>
        </ResultCallout>
      )}

      {state.status === "stopped" && (
        <ResultCallout icon={Square} title="Journey stopped" tone="amber">
          <Text style={[styles.statusText, { color: colors.foreground }]}>
            Chapters written so far are kept below.
          </Text>
        </ResultCallout>
      )}

      {state.plan && state.plan.prerequisites.length > 0 && (
        <Panel>
          <SectionTitle icon={MapPin} title="Prerequisites" />
          <TagList items={state.plan.prerequisites} />
        </Panel>
      )}

      {titles.length > 0 && (
        <Panel>
          <SectionTitle icon={CircleDot} title="Chapter plan" />
          <View style={styles.planList}>
            {titles.map((title, index) => {
              const done = state.chapters.some((chapter) => chapter.index === index + 1);
              const current = streaming && state.chapters.length === index;
              return (
                <View key={`${title}-${index}`} style={styles.planRow}>
                  {done ? (
                    <Check size={14} color={colors.tone.emerald.fg} />
                  ) : current ? (
                    <Loader2 size={14} color={colors.primary} />
                  ) : (
                    <Text style={[styles.planNumber, { color: colors.mutedForeground }]}>{index + 1}.</Text>
                  )}
                  <Text style={[styles.planTitle, { color: colors.foreground }]}>{title}</Text>
                </View>
              );
            })}
          </View>
        </Panel>
      )}

      {state.chapters.map((chapter) => (
        <Panel key={chapter.index}>
          <View style={styles.chapterHeader}>
            <View style={[styles.chapterBadge, { backgroundColor: colors.tone.sky.bg }]}>
              <Text style={[styles.chapterBadgeText, { color: colors.primary }]}>{chapter.index}</Text>
            </View>
            <Text style={[styles.chapterTitle, { color: colors.foreground }]}>{chapter.title}</Text>
          </View>
          <MarkdownText content={chapter.content} />
          <ListenButton text={chapter.content} label="Chapter" />
          {chapter.analogy ? (
            <ResultCallout icon={Compass} title="Mental model" tone="amber">
              <MarkdownText content={chapter.analogy} />
            </ResultCallout>
          ) : null}
          {chapter.jargon.length > 0 && (
            <View style={styles.jargon}>
              <Text style={[styles.jargonLabel, { color: colors.mutedForeground }]}>Key terms</Text>
              <TagList items={chapter.jargon} />
            </View>
          )}
        </Panel>
      ))}

      {state.status !== "idle" && !streaming && (
        <ActionButton label="Clear results" icon={RefreshCcw} variant="outline" onPress={clearResults} />
      )}
      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={reset} />
    </Section>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  statusText: {
    fontSize: 15,
    lineHeight: 22,
  },
  track: {
    height: 6,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
  count: {
    fontSize: 13,
  },
  planList: {
    gap: spacing.sm,
  },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  planNumber: {
    fontSize: 14,
    minWidth: 14,
  },
  planTitle: {
    flex: 1,
    fontSize: 14,
  },
  chapterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  chapterBadge: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  chapterBadgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  chapterTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  jargon: {
    gap: spacing.sm,
  },
  jargonLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
