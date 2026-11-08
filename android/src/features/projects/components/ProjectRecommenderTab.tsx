// src/features/projects/components/ProjectRecommenderTab.tsx
/** Project Recommender: hands-on project ideas for a topic, scope, and difficulty, with advice. */
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BookOpen, Clock, Flag, Hammer, Lightbulb, ListChecks, Package, RefreshCcw, Sparkles } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { CountSlider } from "@/components/tool/CountSlider";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { TagList } from "@/components/tool/TagList";
import { useRequest } from "@/hooks/useRequest";
import { recommendProjects } from "../lib/generators";
import { toProjectDraft } from "../lib/normalise";
import { MAX_RECOMMENDATIONS, TOPIC_MAX } from "../lib/validate";
import { projectDifficultyOptions, projectSizeOptions } from "../options";
import { useSavedDraft } from "../hooks/useSavedDraft";
import type { ProjectFormValues, ProjectIdea, ProjectResult } from "../types";

const STORAGE_KEY = "learning.projects.generate.v1";

const DEFAULTS: ProjectFormValues = {
  topic: "Python web scraping",
  projectSize: "medium",
  difficultyLevel: "intermediate",
  numRecommendations: 3,
};

const parseDraft = (raw: unknown) => toProjectDraft(raw, DEFAULTS);

export function ProjectRecommenderTab() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const draft = useSavedDraft<ProjectFormValues, ProjectResult>(STORAGE_KEY, DEFAULTS, parseDraft);
  const request = useRequest(recommendProjects);
  const { form, setForm, setResult } = draft;

  const update = useCallback(
    <K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) => {
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
          label="Topic / technology"
          placeholder="e.g. Python web scraping"
          value={form.topic}
          onChangeText={(text) => update("topic", text)}
          editable={!request.pending}
          maxLength={TOPIC_MAX}
        />
        <SelectField
          label="Project size"
          options={projectSizeOptions}
          value={form.projectSize}
          onChange={(value) => update("projectSize", value as ProjectFormValues["projectSize"])}
          allowCustom={false}
        />
        <SelectField
          label="Difficulty level"
          options={projectDifficultyOptions}
          value={form.difficultyLevel}
          onChange={(value) => update("difficultyLevel", value as ProjectFormValues["difficultyLevel"])}
          allowCustom={false}
        />
        <CountSlider
          label="Number of projects"
          min={1}
          max={MAX_RECOMMENDATIONS}
          value={form.numRecommendations}
          onChange={(value) => update("numRecommendations", value)}
        />
        <ActionButton
          label={request.pending ? "Finding projects…" : "Recommend projects"}
          icon={Hammer}
          loading={request.pending}
          onPress={handleGenerate}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result && (
        <>
          {result.projects.length === 0 ? (
            <Text style={[styles.empty, { color: colors.mutedForeground }]}>No projects returned.</Text>
          ) : (
            result.projects.map((project, index) => (
              <ProjectCard key={`${project.title}-${index}`} project={project} index={index} />
            ))
          )}

          {result.advice.trim() !== "" && (
            <ResultCallout icon={Lightbulb} title="Advice" tone="emerald">
              <MarkdownText content={result.advice.trim()} />
            </ResultCallout>
          )}
        </>
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={reset} />
    </Section>
  );
}

function ProjectCard({ project, index }: { project: ProjectIdea; index: number }) {
  const colors = useThemeColors();
  return (
    <Panel>
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: colors.muted }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>{index + 1}</Text>
        </View>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>{project.title}</Text>
        {project.estimatedHours !== null && (
          <View style={[styles.hours, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Clock size={12} color={colors.mutedForeground} />
            <Text style={[styles.hoursText, { color: colors.mutedForeground }]}>{project.estimatedHours}h</Text>
          </View>
        )}
      </View>

      {project.description.trim() !== "" && (
        <Text style={[styles.description, { color: colors.mutedForeground }]}>{project.description.trim()}</Text>
      )}

      {project.keyConcepts.length > 0 && (
        <View style={styles.group}>
          <SectionTitle icon={BookOpen} title="Key concepts" />
          <TagList items={project.keyConcepts} />
        </View>
      )}

      {project.prerequisites.length > 0 && (
        <View style={styles.group}>
          <SectionTitle icon={ListChecks} title="Prerequisites" />
          <BulletList items={project.prerequisites} />
        </View>
      )}

      {project.deliverables.length > 0 && (
        <View style={styles.group}>
          <SectionTitle icon={Package} title="Deliverables" />
          <BulletList items={project.deliverables} />
        </View>
      )}

      {project.stretchGoals.length > 0 && (
        <View style={styles.group}>
          <SectionTitle icon={Flag} title="Stretch goals" />
          <BulletList items={project.stretchGoals} />
        </View>
      )}
    </Panel>
  );
}

function BulletList({ items }: { items: string[] }) {
  const colors = useThemeColors();
  return (
    <View style={styles.bullets}>
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.bulletRow}>
          <Text style={[styles.bulletMark, { color: colors.mutedForeground }]}>•</Text>
          <Text style={[styles.bulletText, { color: colors.foreground }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 14,
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
  hours: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  hoursText: {
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
  },
  group: {
    gap: spacing.sm,
  },
  bullets: {
    gap: spacing.sm,
  },
  bulletRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  bulletMark: {
    fontSize: 14,
    lineHeight: 21,
    minWidth: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
});
