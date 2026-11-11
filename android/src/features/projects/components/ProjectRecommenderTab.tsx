// src/features/projects/components/ProjectRecommenderTab.tsx
/** Project Recommender: the form page (fields in the body, one action in the footer) and the result page (checklist of project ideas, with Find more in the footer). */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ArrowLeft, BookOpen, Check, Clock, Flame, Flag, Gauge, Hammer, Lightbulb, ListChecks, Package, Pencil, Sparkles, Sprout, type LucideIcon } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { keptCount } from "@/lib/kept";
import { ActionButton, ChoiceChips, ErrorText, Field, pointerCursor, TextField } from "@/components/tool/FormControls";
import { CountSlider } from "@/components/tool/CountSlider";
import { CopyButton } from "@/components/tool/CopyButton";
import { Disclosure } from "@/components/tool/Disclosure";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { TagList } from "@/components/tool/TagList";
import type { ProjectRecommenderState } from "../hooks/useProjectRecommender";
import { projectDifficultyOptions, projectSizeOptions } from "../options";
import type { ProjectDifficulty, ProjectIdea, ProjectResult } from "../types";
import { MAX_RECOMMENDATIONS, TOPIC_MAX } from "../lib/validate";

const DIFFICULTY_ICONS: Record<ProjectDifficulty, LucideIcon> = {
  beginner: Sprout,
  intermediate: Gauge,
  advanced: Flame,
};

const DIFFICULTY_TONES = {
  beginner: "emerald",
  intermediate: "sky",
  advanced: "amber",
} as const;

export function ProjectFormBody({ recommender }: { recommender: ProjectRecommenderState }) {
  const { form, pending, update } = recommender;

  return (
    <View style={styles.body}>
      <TextField
        label="Topic or technology"
        placeholder="e.g. Python web scraping"
        value={form.topic}
        onChangeText={(text) => update("topic", text)}
        editable={!pending}
        maxLength={TOPIC_MAX}
      />
      <Field label="Time available">
        <ChoiceChips options={projectSizeOptions} value={form.projectSize} onChange={(value) => update("projectSize", value)} />
      </Field>
      <Field label="Difficulty">
        <ChoiceChips
          options={projectDifficultyOptions}
          value={form.difficultyLevel}
          onChange={(value) => update("difficultyLevel", value)}
        />
      </Field>
      <CountSlider
        label="Number of projects"
        min={1}
        max={MAX_RECOMMENDATIONS}
        value={form.numRecommendations}
        onChange={(value) => update("numRecommendations", value)}
      />
    </View>
  );
}

export function EditFormButton({ onPress }: { onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Edit form"
      style={({ pressed }) => [styles.iconButton, pointerCursor, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
    >
      <Pencil size={20} color={colors.foreground} />
    </Pressable>
  );
}

export function ProjectFormFooter({ recommender, onBack }: { recommender: ProjectRecommenderState; onBack?: () => void }) {
  const { pending, error, saveError, recommend } = recommender;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ErrorText message={saveError} />
      <ActionButton
        label={pending ? "Finding projects…" : "Recommend projects"}
        icon={Sparkles}
        loading={pending}
        onPress={recommend}
      />
      {onBack ? (
        <ActionButton label="Back to projects" icon={ArrowLeft} variant="outline" disabled={pending} onPress={onBack} />
      ) : null}
    </View>
  );
}

export function ProjectResults({
  result,
  difficulty,
  onToggleKept,
}: {
  result: ProjectResult;
  difficulty: ProjectDifficulty;
  onToggleKept: (index: number) => void;
}) {
  const colors = useThemeColors();
  const hasAdvice = result.advice.trim() !== "";
  const kept = keptCount(result.projects);

  return (
    <View style={styles.list}>
      {kept > 0 && (
        <View style={styles.status}>
          <Check size={14} color={colors.primary} />
          <Text style={[typeScale.caption, { color: colors.mutedForeground }]}>{kept} kept</Text>
        </View>
      )}

      {result.projects.length === 0 ? (
        <EmptyHint icon={Hammer} title="No projects returned" hint="Change the topic or time, then try again." />
      ) : (
        result.projects.map((project, index) => (
          <ProjectCard
            key={`${project.title}-${index}`}
            project={project}
            difficulty={difficulty}
            selected={project.kept}
            onToggle={() => onToggleKept(index)}
          />
        ))
      )}

      {hasAdvice && (
        <ResultCallout icon={Lightbulb} title="Advice" tone="emerald">
          <MarkdownText content={result.advice.trim()} />
          <View style={styles.actions}>
            <CopyButton text={result.advice} label="Copy advice" />
            <ListenButton text={result.advice} label="Advice" />
          </View>
        </ResultCallout>
      )}
    </View>
  );
}

export function ProjectResultsFooter({ recommender }: { recommender: ProjectRecommenderState }) {
  const { pending, error, saveError, recommend } = recommender;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ErrorText message={saveError} />
      <ActionButton label="Find more" icon={Sparkles} loading={pending} onPress={recommend} />
    </View>
  );
}

function ProjectCard({
  project,
  difficulty,
  selected,
  onToggle,
}: {
  project: ProjectIdea;
  difficulty: ProjectDifficulty;
  selected: boolean;
  onToggle: () => void;
}) {
  const colors = useThemeColors();
  const name = project.title.trim() || "project";
  const description = project.description.trim();
  const copyText = [project.title.trim(), description].filter(Boolean).join("\n");
  const DifficultyIcon = DIFFICULTY_ICONS[difficulty];
  const difficultyLabel = projectDifficultyOptions.find((option) => option.value === difficulty)?.label ?? difficulty;
  const difficultyTone = colors.tone[DIFFICULTY_TONES[difficulty]];
  const hasDetails =
    description !== "" ||
    project.keyConcepts.length > 0 ||
    project.deliverables.length > 0 ||
    project.prerequisites.length > 0 ||
    project.stretchGoals.length > 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: selected ? colors.primary : colors.border }]}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityLabel={`Keep ${name}`}
        accessibilityState={{ checked: selected }}
        style={styles.head}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: selected ? colors.primary : colors.border,
              backgroundColor: selected ? colors.primary : colors.background,
            },
          ]}
        >
          {selected ? <Check size={14} color={colors.primaryForeground} /> : null}
        </View>
        <View style={styles.headText}>
          <Text style={[typeScale.title, { color: colors.foreground }]}>{project.title}</Text>
          {description !== "" && (
            <Text numberOfLines={1} style={[typeScale.body, { color: colors.mutedForeground }]}>
              {description}
            </Text>
          )}
          <View style={styles.meta}>
            <View style={[styles.chip, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <DifficultyIcon size={12} color={difficultyTone.fg} />
              <Text style={[typeScale.caption, { color: colors.foreground }]}>{difficultyLabel}</Text>
            </View>
            {project.estimatedHours !== null && (
              <View style={[styles.chip, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Clock size={12} color={colors.mutedForeground} />
                <Text style={[typeScale.caption, { color: colors.mutedForeground }]}>{project.estimatedHours}h</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>

      <View style={styles.actions}>
        <CopyButton text={copyText} label={`Copy ${name}`} />
        <ListenButton text={project.description} label={name} />
      </View>

      {hasDetails && (
        <Disclosure title="Details" icon={ListChecks} summary={project.keyConcepts.join(", ") || undefined}>
          {description !== "" && <Text style={[typeScale.body, { color: colors.foreground }]}>{description}</Text>}

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
        </Disclosure>
      )}
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  const colors = useThemeColors();
  return (
    <View style={styles.bullets}>
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.bulletRow}>
          <Text style={[typeScale.body, { color: colors.mutedForeground }]}>•</Text>
          <Text style={[typeScale.body, styles.bulletText, { color: colors.foreground }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.lg,
  },
  footer: {
    gap: spacing.sm,
  },
  iconButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    gap: spacing.sm,
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  card: {
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderRadius: shape.md,
    alignItems: "center",
    justifyContent: "center",
  },
  headText: {
    flex: 1,
    gap: spacing.xs,
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: shape.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
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
  bulletText: {
    flex: 1,
  },
});
