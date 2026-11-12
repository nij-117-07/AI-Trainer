// src/features/testing-portal/components/PortalSessionList.tsx
/** Saved sessions for a Testing Portal tool. Tap one to open it, or the trash icon to delete it after confirming. */
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Layers, Trash2 } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ErrorText, pointerCursor } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { TheoreticalSessionSummary as SessionSummary } from "../lib/persistence";

interface PortalSessionListProps {
  sessions: SessionSummary[];
  activeId: string | null;
  onOpen: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function PortalSessionList({ sessions, activeId, onOpen, onDelete }: PortalSessionListProps) {
  const [listError, setListError] = useState<string | null>(null);

  function run(action: Promise<void>) {
    setListError(null);
    action.catch((error: unknown) => {
      setListError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    });
  }

  function confirmDelete(session: SessionSummary) {
    Alert.alert(
      "Delete this session?",
      `"${session.title}" and its ${session.questionCount} questions and answers will be permanently removed.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => run(onDelete(session.id)) },
      ],
    );
  }

  return (
    <Section>
      <SectionTitle icon={Layers} title="Your sessions" />
      <ErrorText message={listError} />

      {sessions.length === 0 ? (
        <EmptyHint icon={Layers} title="No sessions yet" hint="Start a new session to generate questions." />
      ) : (
        <View style={styles.list}>
          {sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              isOpen={session.id === activeId}
              onOpen={() => run(onOpen(session.id))}
              onDelete={() => confirmDelete(session)}
            />
          ))}
        </View>
      )}
    </Section>
  );
}

function SessionRow({
  session,
  isOpen,
  onOpen,
  onDelete,
}: {
  session: SessionSummary;
  isOpen: boolean;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const colors = useThemeColors();
  const updated = session.updatedAt
    ? new Date(session.updatedAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : "Not generated yet";
  const count = `${session.questionCount} ${session.questionCount === 1 ? "question" : "questions"}`;

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`Open session ${session.title}`}
      accessibilityState={{ selected: isOpen }}
      style={({ pressed }) => [
        styles.card,
        pointerCursor,
        { backgroundColor: colors.card, borderColor: isOpen ? colors.primary : colors.border },
        pressed && { backgroundColor: colors.muted },
      ]}
    >
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {session.title}
        </Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {`${count} · ${isOpen ? "Open · " : ""}${updated}`}
        </Text>
      </View>
      <Pressable
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel={`Delete session ${session.title}`}
        style={({ pressed }) => [styles.deleteButton, pointerCursor, pressed && { backgroundColor: colors.muted }]}
      >
        <Trash2 size={20} color={colors.destructive} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: shape.lg,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  title: {
    ...typeScale.title,
  },
  meta: {
    ...typeScale.caption,
  },
  deleteButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
