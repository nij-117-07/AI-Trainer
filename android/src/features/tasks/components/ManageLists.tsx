// src/features/tasks/components/ManageLists.tsx
/** Create, rename, and delete projects and labels. Deleting one removes it from the tasks that use it. */
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ArrowLeft, Plus, Trash2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { CardGrid } from "@/components/tool/CardGrid";
import { ActionButton, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { confirmAction } from "@/features/chatbot/lib/confirm";
import type { NamedItem } from "../types";
import type { useTasks } from "../hooks/useTasks";

type TaskStore = ReturnType<typeof useTasks>;

export function ManageLists({ store, onBack }: { store: TaskStore; onBack: () => void }) {
  const colors = useThemeColors();
  return (
    <Section>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Back to tasks"
        style={({ pressed }) => [styles.backRow, pressed && { opacity: 0.7 }]}
      >
        <ArrowLeft size={18} color={colors.foreground} />
        <Text style={[styles.backText, { color: colors.foreground }]}>All tasks</Text>
      </Pressable>

      <CardGrid>
        <NamedListPanel
          title="Projects"
          noun="project"
          hint="Group tasks, like Work or Home. Deleting a project keeps its tasks."
          items={store.projects}
          onAdd={store.addProject}
          onRename={store.renameProject}
          onRemove={store.removeProject}
        />
        <NamedListPanel
          title="Labels"
          noun="label"
          hint="Tag tasks across projects. Deleting a label removes it from every task."
          items={store.labels}
          onAdd={store.addLabel}
          onRename={store.renameLabel}
          onRemove={store.removeLabel}
        />
      </CardGrid>
    </Section>
  );
}

interface NamedListPanelProps {
  title: string;
  noun: "project" | "label";
  hint: string;
  items: NamedItem[];
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}

function NamedListPanel({ title, noun, hint, items, onAdd, onRename, onRemove }: NamedListPanelProps) {
  const colors = useThemeColors();
  const [name, setName] = useState("");
  const trimmed = name.trim();

  function add() {
    if (!trimmed) return;
    onAdd(trimmed);
    setName("");
  }

  return (
    <Panel>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.hint, { color: colors.mutedForeground }]}>{hint}</Text>
      <TextField label={`New ${noun}`} value={name} onChangeText={setName} onSubmitEditing={add} maxLength={60} />
      <ActionButton label={`Add ${noun}`} icon={Plus} onPress={add} />
      {items.length === 0 ? (
        <Text accessibilityLiveRegion="polite" style={[styles.hint, { color: colors.mutedForeground }]}>
          No {title.toLowerCase()} yet.
        </Text>
      ) : null}
      {items.map((item) => (
        <NamedRow
          key={item.id}
          item={item}
          noun={noun}
          onRename={(next) => onRename(item.id, next)}
          onRemove={() => onRemove(item.id)}
        />
      ))}
    </Panel>
  );
}

function NamedRow({
  item,
  noun,
  onRename,
  onRemove,
}: {
  item: NamedItem;
  noun: "project" | "label";
  onRename: (name: string) => void;
  onRemove: () => void;
}) {
  const colors = useThemeColors();
  const [draft, setDraft] = useState(item.name);

  useEffect(() => {
    setDraft(item.name);
  }, [item.name]);

  function commit() {
    const next = draft.trim();
    if (!next) {
      setDraft(item.name);
      return;
    }
    if (next !== item.name) onRename(next);
  }

  return (
    <View style={[styles.row, { borderColor: colors.border, backgroundColor: colors.background }]}>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        onBlur={commit}
        onSubmitEditing={commit}
        maxLength={60}
        accessibilityLabel={`Name of ${noun} ${item.name}`}
        style={[styles.input, { color: colors.foreground }]}
      />
      <Pressable
        onPress={() =>
          confirmAction(
            `Delete ${noun}?`,
            noun === "project" ? "Its tasks stay on your list without a project." : "It will be removed from every task.",
            onRemove
          )
        }
        accessibilityRole="button"
        accessibilityLabel={`Delete ${noun} ${item.name}`}
        style={styles.removeButton}
      >
        <Trash2 size={18} color={colors.destructive} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 44,
  },
  backText: {
    fontSize: 15,
    fontWeight: "600",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingLeft: spacing.lg,
  },
  input: {
    flex: 1,
    minHeight: 44,
    fontSize: 16,
    paddingVertical: spacing.md,
  },
  removeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
