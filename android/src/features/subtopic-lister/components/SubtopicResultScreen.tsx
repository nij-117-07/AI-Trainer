// src/features/subtopic-lister/components/SubtopicResultScreen.tsx
/**
 * Subtopic Lister result page. The suggestions are a checklist: tick the ones to keep. Kept items
 * stay when "Find more" makes a new batch, and unticked items are replaced. Copy and listen read
 * the whole list. The header icon opens the form.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Check, ListTree, Pencil, Sparkles } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ErrorText } from "@/components/tool/FormControls";
import { CopyButton } from "@/components/tool/CopyButton";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ListenButton } from "@/components/tool/ListenButton";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { useSubtopicLister } from "../hooks/useSubtopicLister";
import type { Subtopic } from "../types";

const FORM_ROUTE = "/learning/subtopic-lister/new";

export function SubtopicResultScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { result, pending, error, keptCount, toggleKept, suggest } = useSubtopicLister();
  const subtopics = result?.subtopics ?? [];
  const hasResults = subtopics.length > 0;
  const plainText = toPlainText(subtopics);

  function openForm() {
    router.push(FORM_ROUTE as never);
  }

  return (
    <ToolScreen
      title="Subtopic Lister"
      headerRight={<EditFormButton onPress={openForm} />}
      footer={<ResultFooter error={error} pending={pending} onFindMore={suggest} />}
    >
      {hasResults ? (
        <View style={styles.body}>
          <View style={styles.header}>
            <SectionTitle icon={ListTree} title="Next subtopics" />
            <View style={styles.actions}>
              <CopyButton text={plainText} label="Copy subtopics" />
              <ListenButton text={plainText} label="subtopics" />
            </View>
          </View>
          {keptCount > 0 ? (
            <View style={styles.status}>
              <Check size={14} color={colors.primary} />
              <Text style={[typeScale.caption, { color: colors.mutedForeground }]}>{keptCount} kept</Text>
            </View>
          ) : null}
          <View style={[styles.list, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {subtopics.map((item, index) => (
              <SubtopicRow
                key={`${item.name}-${index}`}
                item={item}
                first={index === 0}
                onToggle={() => toggleKept(index)}
              />
            ))}
          </View>
        </View>
      ) : (
        <EmptyHint icon={ListTree} title="No subtopics yet" hint="Find more subtopics from what you have finished." />
      )}
    </ToolScreen>
  );
}

function ResultFooter({
  error,
  pending,
  onFindMore,
}: {
  error: string | null;
  pending: boolean;
  onFindMore: () => void;
}) {
  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton label="Find more" icon={Sparkles} loading={pending} onPress={onFindMore} />
    </View>
  );
}

function EditFormButton({ onPress }: { onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Edit form"
      style={({ pressed }) => [styles.iconButton, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
    >
      <Pencil size={20} color={colors.foreground} />
    </Pressable>
  );
}

function SubtopicRow({
  item,
  first,
  onToggle,
}: {
  item: Subtopic;
  first: boolean;
  onToggle: () => void;
}) {
  const colors = useThemeColors();
  const checked = item.kept;
  const description = item.description.trim();

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityLabel={`Keep subtopic ${item.name}`}
      accessibilityState={{ checked }}
      style={({ pressed }) => [
        styles.row,
        { minHeight: description ? 72 : 56, borderTopColor: colors.border },
        !first && styles.divider,
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      <View
        style={[
          styles.check,
          { borderColor: checked ? colors.primary : colors.border, backgroundColor: checked ? colors.primary : colors.background },
        ]}
      >
        {checked ? <Check size={16} color={colors.primaryForeground} /> : null}
      </View>
      <View style={styles.text}>
        <Text numberOfLines={2} style={[styles.name, { color: colors.foreground }]}>
          {item.name}
        </Text>
        {description ? (
          <Text numberOfLines={1} style={[styles.description, { color: colors.mutedForeground }]}>
            {description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function toPlainText(subtopics: Subtopic[]): string {
  return subtopics
    .map((item) => {
      const description = item.description.trim();
      return description ? `${item.name}. ${description}` : item.name;
    })
    .join("\n");
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  footer: {
    gap: spacing.md,
  },
  iconButton: {
    width: touchTarget,
    height: touchTarget,
    borderWidth: 1,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    borderWidth: 1,
    borderRadius: shape.lg,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  divider: {
    borderTopWidth: 1,
  },
  check: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderRadius: shape.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    ...typeScale.body,
    fontWeight: "600",
  },
  description: {
    ...typeScale.label,
    fontWeight: "400",
  },
});
