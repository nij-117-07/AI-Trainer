// src/features/resource-suggestor/components/ResourceSuggestorTab.tsx
/** Resource Suggestor: the form in the body, resources as compact rows with a link to each, and one primary action in the footer. */
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import {
  ArrowLeft,
  BookMarked,
  BookOpen,
  Check,
  Code,
  ExternalLink,
  FileText,
  GraduationCap,
  Headphones,
  Lightbulb,
  Newspaper,
  Pencil,
  ScrollText,
  Sparkles,
  Video,
  type LucideIcon,
} from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { keptCount } from "@/lib/kept";
import { ActionButton, ChoiceChips, ErrorText, Field, Panel, pointerCursor, TextField } from "@/components/tool/FormControls";
import { CopyButton } from "@/components/tool/CopyButton";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { PREFERENCES_MAX, SUBJECT_MAX } from "../lib/validate";
import { isResourceType, RESOURCE_TYPE_OPTIONS } from "../options";
import type { ResourceSuggestorState } from "../hooks/useResourceSuggestor";
import type { ResourceItem, ResourceSuggestorResult } from "../types";

const TYPE_ICONS: Record<string, LucideIcon> = {
  book: BookOpen,
  youtube_video: Video,
  blog_post: Newspaper,
  online_course: GraduationCap,
  documentation: FileText,
  podcast: Headphones,
  github_repo: Code,
  paper: ScrollText,
};

export function ResourceSuggestorForm({ suggestor }: { suggestor: ResourceSuggestorState }) {
  const { form, pending, update } = suggestor;

  return (
    <Panel>
      <TextField
        label="Current knowledge"
        placeholder="e.g. Python programming and basic statistics"
        value={form.backgroundSubject}
        onChangeText={(text) => update("backgroundSubject", text)}
        editable={!pending}
        maxLength={SUBJECT_MAX}
      />
      <TextField
        label="Topic to learn"
        placeholder="e.g. Machine learning and deep learning"
        value={form.targetTopic}
        onChangeText={(text) => update("targetTopic", text)}
        editable={!pending}
        maxLength={SUBJECT_MAX}
      />
      <Field label="Resource type">
        <ChoiceChips
          options={RESOURCE_TYPE_OPTIONS}
          value={form.resourceType}
          onChange={(value) => {
            if (isResourceType(value)) update("resourceType", value);
          }}
        />
      </Field>
      <TextField
        label="Preferences (optional)"
        placeholder="e.g. Hands-on projects, 10 hours per week"
        value={form.additionalPreferences}
        onChangeText={(text) => update("additionalPreferences", text)}
        editable={!pending}
        maxLength={PREFERENCES_MAX}
        multiline
        voice
        style={styles.compactInput}
      />
    </Panel>
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

export function ResourceSuggestorResults({
  suggestor,
  onToggleKept,
}: {
  suggestor: ResourceSuggestorState;
  onToggleKept: (index: number) => void;
}) {
  const colors = useThemeColors();
  const { result, pending } = suggestor;

  if (!result) {
    return (
      <EmptyHint
        icon={BookMarked}
        title={pending ? "Finding resources…" : "No resources yet"}
        hint={pending ? "This can take a moment." : "Enter a topic, then tap Find resources."}
      />
    );
  }

  const kept = keptCount(result.recommendedResources);

  return (
    <Section>
      <Panel>
        <View style={styles.header}>
          <SectionTitle icon={BookMarked} title="Recommended resources" />
          <CopyButton text={toCopyText(result)} label="Copy resources" />
        </View>
        {kept > 0 && (
          <View style={styles.status}>
            <Check size={14} color={colors.primary} />
            <Text style={[styles.caption, { color: colors.mutedForeground }]}>{kept} kept</Text>
          </View>
        )}
        {result.recommendedResources.length === 0 ? (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>No resources found. Try a broader topic.</Text>
        ) : (
          result.recommendedResources.map((resource, index) => (
            <ResourceRow
              key={`${resource.title}-${index}`}
              resource={resource}
              divided={index > 0}
              onToggle={() => onToggleKept(index)}
            />
          ))
        )}
      </Panel>

      {result.nextSteps.trim() !== "" && (
        <ResultCallout icon={Lightbulb} title="Next steps" tone="emerald">
          <MarkdownText content={result.nextSteps.trim()} />
          <ListenButton text={result.nextSteps} label="Next steps" />
        </ResultCallout>
      )}
    </Section>
  );
}

export function ResourceSuggestorFooter({
  suggestor,
  onBack,
}: {
  suggestor: ResourceSuggestorState;
  onBack?: () => void;
}) {
  const { pending, error, saveError, result, suggest } = suggestor;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ErrorText message={saveError} />
      <ActionButton
        label={result ? "Find more" : pending ? "Finding resources…" : "Find resources"}
        icon={Sparkles}
        loading={pending}
        onPress={suggest}
      />
      {onBack ? (
        <ActionButton label="Back to resources" icon={ArrowLeft} variant="outline" disabled={pending} onPress={onBack} />
      ) : null}
    </View>
  );
}

function ResourceRow({ resource, divided, onToggle }: { resource: ResourceItem; divided: boolean; onToggle: () => void }) {
  const colors = useThemeColors();
  const TypeIcon = TYPE_ICONS[resource.type] ?? BookMarked;
  const reason = resource.description.trim();

  return (
    <View style={[styles.row, divided && { borderTopWidth: 1, borderTopColor: colors.border }]}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityLabel={`Keep ${resource.title}`}
        accessibilityState={{ checked: resource.kept }}
        style={[
          styles.checkbox,
          {
            borderColor: resource.kept ? colors.primary : colors.border,
            backgroundColor: resource.kept ? colors.primary : colors.background,
          },
        ]}
      >
        {resource.kept ? <Check size={14} color={colors.primaryForeground} /> : null}
      </Pressable>
      <View style={styles.text}>
        <Text numberOfLines={1} style={[styles.title, { color: colors.foreground }]}>
          {resource.title}
        </Text>
        {resource.type.trim() !== "" && (
          <View style={styles.meta}>
            <TypeIcon size={14} color={colors.primary} />
            <Text style={[styles.caption, { color: colors.mutedForeground }]}>{typeWord(resource.type)}</Text>
          </View>
        )}
        {reason !== "" && (
          <Text numberOfLines={1} style={[styles.caption, { color: colors.mutedForeground }]}>
            {reason}
          </Text>
        )}
      </View>
      <Pressable
        onPress={() => void Linking.openURL(openUrlFor(resource)).catch(() => undefined)}
        accessibilityRole="link"
        accessibilityLabel={`Open resource ${resource.title}`}
        style={({ pressed }) => [
          styles.openButton,
          pointerCursor,
          { borderColor: colors.border, backgroundColor: colors.card },
          pressed && { backgroundColor: colors.muted },
        ]}
      >
        <ExternalLink size={20} color={colors.foreground} />
      </Pressable>
    </View>
  );
}

function typeWord(type: string): string {
  const option = RESOURCE_TYPE_OPTIONS.find((item) => item.value === type.trim());
  return option?.label ?? type.replace(/_/g, " ");
}

// Falls back to a web search when the model gave no link in access info.
function openUrlFor(resource: ResourceItem): string {
  const link = resource.accessInfo.match(/https?:\/\/\S+/);
  return link ? link[0] : `https://www.google.com/search?q=${encodeURIComponent(resource.title)}`;
}

function toCopyText(result: ResourceSuggestorResult): string {
  const resources = result.recommendedResources.map((resource) =>
    [resource.title, resource.type.trim() ? typeWord(resource.type) : "", resource.description.trim(), resource.accessInfo.trim()]
      .filter((part) => part !== "")
      .join("\n"),
  );
  const next = result.nextSteps.trim();
  return [...resources, ...(next ? [`Next steps\n${next}`] : [])].join("\n\n");
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  compactInput: {
    minHeight: 72,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  empty: {
    ...typeScale.label,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 72,
    paddingVertical: spacing.xs,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typeScale.label,
    fontWeight: "600",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  caption: {
    ...typeScale.caption,
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderRadius: shape.md,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  openButton: {
    width: touchTarget,
    height: touchTarget,
    borderWidth: 1,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
