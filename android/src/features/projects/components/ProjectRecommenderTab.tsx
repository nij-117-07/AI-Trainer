// src/features/projects/components/ProjectRecommenderTab.tsx
/** Project Recommender: hands-on project ideas for a topic, scope, and difficulty, with advice. The form sits in the footer. */
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { BookOpen, Clock, Flag, Hammer, Lightbulb, ListChecks, Package, Sparkles } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { CountSlider } from "@/components/tool/CountSlider";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { ListenButton } from "@/components/tool/ListenButton";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { TagList } from "@/components/tool/TagList";
import type { ProjectRecommenderState } from "../hooks/useProjectRecommender";
import { projectDifficultyOptions, projectSizeOptions } from "../options";
import type { ProjectIdea } from "../types";
import { isProjectDifficulty, isProjectSize, MAX_RECOMMENDATIONS, TOPIC_MAX } from "../lib/validate";

export function ProjectResults({ recommender }: { recommender: ProjectRecommenderState }) {
  const colors = useThemeColors();
  const { result } = recommender;

  if (!result) {
    return (
      <EmptyHint
        icon={Hammer}
        title="Find a project to build"
        hint="Name a topic in the form below, then tap Recommend projects."
      />
    );
  }

  return (
    <Section>
      {result.projects.length === 0 ? (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>No projects returned. Try again.</Text>
      ) : (
        result.projects.map((project, index) => (
          <ProjectCard key={`${project.title}-${index}`} project={project} index={index} />
        ))
      )}

      {result.advice.trim() !== "" && (
        <ResultCallout icon={Lightbulb} title="Advice" tone="emerald">
          <MarkdownText content={result.advice.trim()} />
          <ListenButton text={result.advice} label="Advice" />
        </ResultCallout>
      )}
    </Section>
  );
}

export function ProjectFooter({ recommender }: { recommender: ProjectRecommenderState }) {
  const { form, pending, error, update, recommend } = recommender;

  return (
    <View style={styles.footer}>
      <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent} keyboardShouldPersistTaps="handled">
        <TextField
          label="Topic or technology"
          placeholder="e.g. Python web scraping"
          value={form.topic}
          onChangeText={(text) => update("topic", text)}
          editable={!pending}
          maxLength={TOPIC_MAX}
        />
        <SelectField
          label="Project size"
          options={projectSizeOptions}
          value={form.projectSize}
          onChange={(value) => {
            if (isProjectSize(value)) update("projectSize", value);
          }}
          allowCustom={false}
        />
        <SelectField
          label="Difficulty level"
          options={projectDifficultyOptions}
          value={form.difficultyLevel}
          onChange={(value) => {
            if (isProjectDifficulty(value)) update("difficultyLevel", value);
          }}
          allowCustom={false}
        />
        <CountSlider
          label="Number of projects"
          min={1}
          max={MAX_RECOMMENDATIONS}
          value={form.numRecommendations}
          onChange={(value) => update("numRecommendations", value)}
        />
      </ScrollView>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Finding projects…" : "Recommend projects"}
        icon={Sparkles}
        loading={pending}
        onPress={recommend}
      />
    </View>
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
        <>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>{project.description.trim()}</Text>
          <ListenButton text={project.description} label="Project" />
        </>
      )}

      {project.keyConcepts.length > 0 && (
        <View style={styles.group}>
          <SectionTitle icon={BookOpen} title="Key concepts" />
          <TagList items={project.keyConcepts} />
        </View>
      )}

      {project.deliverables.length > 0 && (
        <View style={styles.group}>
          <SectionTitle icon={Package} title="Deliverables" />
          <BulletList items={project.deliverables} />
        </View>
      )}

      {project.prerequisites.length > 0 && (
        <View style={styles.group}>
          <SectionTitle icon={ListChecks} title="Prerequisites" />
          <BulletList items={project.prerequisites} />
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
