// src/features/resource-suggestor/components/ResourceSuggestorTab.tsx
/** Resource Suggestor: a learning path summary, curated resources with reasons, and next steps. The form sits in the footer. */
import { ScrollView, StyleSheet, Text, View } from "react-native";
import {
  BookMarked,
  Clock,
  ExternalLink,
  Lightbulb,
  Sparkles,
  User,
  type LucideIcon,
} from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { ListenButton } from "@/components/tool/ListenButton";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { PREFERENCES_MAX, SUBJECT_MAX } from "../lib/validate";
import { isResourceType, RESOURCE_TYPE_OPTIONS } from "../options";
import type { ResourceSuggestorState } from "../hooks/useResourceSuggestor";
import type { ResourceItem } from "../types";

export function ResourceSuggestorResults({ suggestor }: { suggestor: ResourceSuggestorState }) {
  const colors = useThemeColors();
  const { result, pending } = suggestor;

  if (!result) {
    return (
      <EmptyHint
        icon={BookMarked}
        title={pending ? "Finding resources…" : "Find your resources"}
        hint={pending ? "This can take a moment." : "Describe what you know and what you want to learn in the form, then tap Suggest resources."}
      />
    );
  }

  return (
    <Section>
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
          <ListenButton text={result.nextSteps} label="Next steps" />
        </ResultCallout>
      )}
    </Section>
  );
}

export function ResourceSuggestorFooter({ suggestor }: { suggestor: ResourceSuggestorState }) {
  const { form, pending, error, update, suggest } = suggestor;

  return (
    <View style={styles.footer}>
      <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent} keyboardShouldPersistTaps="handled">
        <TextField
          label="Background subject"
          placeholder="e.g. Python programming and basic statistics"
          value={form.backgroundSubject}
          onChangeText={(text) => update("backgroundSubject", text)}
          editable={!pending}
          maxLength={SUBJECT_MAX}
        />
        <TextField
          label="Target topic"
          placeholder="e.g. Machine learning and deep learning"
          value={form.targetTopic}
          onChangeText={(text) => update("targetTopic", text)}
          editable={!pending}
          maxLength={SUBJECT_MAX}
        />
        <SelectField
          label="Resource type"
          options={RESOURCE_TYPE_OPTIONS}
          value={form.resourceType}
          onChange={(value) => {
            if (isResourceType(value)) update("resourceType", value);
          }}
          allowCustom={false}
        />
        <TextField
          label="Additional preferences (optional)"
          placeholder="e.g. Hands-on projects, 10 hours per week"
          value={form.additionalPreferences}
          onChangeText={(text) => update("additionalPreferences", text)}
          editable={!pending}
          maxLength={PREFERENCES_MAX}
          multiline
          voice
          style={styles.compactInput}
        />
      </ScrollView>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Finding resources…" : "Suggest resources"}
        icon={Sparkles}
        loading={pending}
        onPress={suggest}
      />
    </View>
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

      <Detail icon={ExternalLink} title="How to access" text={resource.accessInfo} />
      <ListenButton text={resource.description} label="Resource" />
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
  footer: {
    gap: spacing.md,
  },
  fields: {
    maxHeight: 340,
  },
  fieldsContent: {
    gap: spacing.md,
  },
  compactInput: {
    minHeight: 72,
  },
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
