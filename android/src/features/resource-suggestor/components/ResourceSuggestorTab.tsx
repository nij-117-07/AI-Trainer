// src/features/resource-suggestor/components/ResourceSuggestorTab.tsx
/** Resource Suggestor: a learning path summary, curated resources with reasons, and next steps. */
import { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  BookMarked,
  Clock,
  ExternalLink,
  Lightbulb,
  RefreshCcw,
  Route,
  Sparkles,
  Target,
  User,
  type LucideIcon,
} from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { suggestResources } from "../lib/generators";
import { toResourceDraft } from "../lib/normalise";
import { PREFERENCES_MAX, SUBJECT_MAX } from "../lib/validate";
import { useSavedDraft } from "../hooks/useSavedDraft";
import type { ResourceItem, ResourceSuggestorFormValues, ResourceSuggestorResult } from "../types";

const STORAGE_KEY = "learning.resource-suggestor.suggest.v1";

const DEFAULTS: ResourceSuggestorFormValues = {
  backgroundSubject: "Python programming and basic statistics",
  targetTopic: "Machine Learning and Deep Learning",
  additionalPreferences: "",
};

const parseDraft = (raw: unknown) => toResourceDraft(raw, DEFAULTS);

export function ResourceSuggestorTab() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const draft = useSavedDraft<ResourceSuggestorFormValues, ResourceSuggestorResult>(STORAGE_KEY, DEFAULTS, parseDraft);
  const request = useRequest(suggestResources);
  const { form, setForm, setResult } = draft;

  const update = useCallback(
    <K extends keyof ResourceSuggestorFormValues>(key: K, value: ResourceSuggestorFormValues[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [setForm],
  );

  function reset() {
    draft.reset();
    request.reset();
  }

  async function handleGenerate() {
    const next = await request.run(settings, form);
    if (next) setResult(next);
  }

  const result = request.data ?? draft.result;

  return (
    <Section>
      <Panel>
        <TextField
          label="Background subject"
          placeholder="e.g. Python programming and basic statistics"
          hint="What you currently know or study"
          value={form.backgroundSubject}
          onChangeText={(text) => update("backgroundSubject", text)}
          editable={!request.pending}
          maxLength={SUBJECT_MAX}
        />
        <TextField
          label="Target topic"
          placeholder="e.g. Machine Learning and Deep Learning"
          hint="What you want to learn"
          value={form.targetTopic}
          onChangeText={(text) => update("targetTopic", text)}
          editable={!request.pending}
          maxLength={SUBJECT_MAX}
        />
        <TextField
          label="Additional preferences (optional)"
          placeholder="e.g. I prefer video tutorials and hands-on projects. I can dedicate 10 hours per week."
          hint="Learning style, time, format, difficulty, constraints"
          value={form.additionalPreferences}
          onChangeText={(text) => update("additionalPreferences", text)}
          editable={!request.pending}
          maxLength={PREFERENCES_MAX}
          multiline
        />
        <ActionButton
          label={request.pending ? "Finding resources…" : "Suggest resources"}
          icon={Sparkles}
          loading={request.pending}
          onPress={handleGenerate}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result && (
        <>
          {result.learningPathSummary.trim() !== "" && (
            <ResultCallout icon={Route} title="Learning path summary" tone="sky">
              <MarkdownText content={result.learningPathSummary.trim()} />
            </ResultCallout>
          )}

          <Panel>
            <SectionTitle icon={BookMarked} title="Recommended resources" />
            {result.recommendedResources.length === 0 ? (
              <Text style={[styles.empty, { color: colors.mutedForeground }]}>No resources returned.</Text>
            ) : (
              result.recommendedResources.map((resource, index) => (
                <ResourceCard key={`${resource.title}-${index}`} resource={resource} index={index} />
              ))
            )}
          </Panel>

          {result.nextSteps.trim() !== "" && (
            <ResultCallout icon={Lightbulb} title="Next steps" tone="emerald">
              <MarkdownText content={result.nextSteps.trim()} />
            </ResultCallout>
          )}
        </>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={reset} />
    </Section>
  );
}

function ResourceCard({ resource, index }: { resource: ResourceItem; index: number }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.card, { borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: colors.muted }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>{index + 1}</Text>
        </View>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>{resource.title}</Text>
      </View>

      <View style={styles.meta}>
        {resource.type.trim() !== "" && <Chip label={resource.type.replace(/_/g, " ")} />}
        {resource.difficultyLevel.trim() !== "" && <Chip label={resource.difficultyLevel} />}
        {resource.authorOrCreator.trim() !== "" && <Chip icon={User} label={resource.authorOrCreator} />}
        {resource.estimatedTime.trim() !== "" && <Chip icon={Clock} label={resource.estimatedTime} />}
      </View>

      {resource.description.trim() !== "" && (
        <Text style={[styles.body, { color: colors.mutedForeground }]}>{resource.description.trim()}</Text>
      )}

      <Detail icon={Target} title="Why this is recommended" text={resource.whyRecommended} />
      <Detail icon={BookMarked} title="Prerequisite knowledge" text={resource.prerequisiteKnowledge} />
      <Detail icon={ExternalLink} title="How to access" text={resource.accessInfo} />
    </View>
  );
}

function Chip({ icon: Icon, label }: { icon?: LucideIcon; label: string }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.chip, { backgroundColor: colors.muted, borderColor: colors.border }]}>
      {Icon && <Icon size={12} color={colors.mutedForeground} />}
      <Text style={[styles.chipText, { color: colors.foreground }]}>{label}</Text>
    </View>
  );
}

function Detail({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  const colors = useThemeColors();
  if (text.trim() === "") return null;
  return (
    <View style={styles.detail}>
      <View style={styles.detailTitle}>
        <Icon size={14} color={colors.primary} />
        <Text style={[styles.detailLabel, { color: colors.foreground }]}>{title}</Text>
      </View>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 14,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
  },
  detail: {
    gap: spacing.xs,
  },
  detailTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
});
