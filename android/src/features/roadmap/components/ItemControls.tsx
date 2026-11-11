// src/features/roadmap/components/ItemControls.tsx
/** Small controls shared by roadmap rows: done button, icon button, inline rename, and add row. */
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Check, Circle, CircleCheck, Plus, X, type LucideIcon } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";

interface DoneToggleProps {
  done: boolean;
  title: string;
  disabled?: boolean;
  onToggle: () => void;
}

export function DoneToggle({ done, title, disabled, onToggle }: DoneToggleProps) {
  const colors = useThemeColors();
  const Icon = done ? CircleCheck : Circle;
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={done ? `Mark "${title}" not done` : `Mark "${title}" done`}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.touch, pressed && { opacity: 0.6 }, disabled && { opacity: 0.4 }]}
    >
      <Icon size={24} color={done ? colors.tone.emerald.fg : colors.mutedForeground} />
    </Pressable>
  );
}

interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export function IconButton({ icon: Icon, label, onPress, disabled }: IconButtonProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.touch, pressed && { opacity: 0.6 }, disabled && { opacity: 0.4 }]}
    >
      <Icon size={20} color={colors.mutedForeground} />
    </Pressable>
  );
}

interface InlineEditProps {
  initialValue: string;
  maxLength: number;
  onSave: (title: string) => void;
  onCancel: () => void;
}

export function InlineEdit({ initialValue, maxLength, onSave, onCancel }: InlineEditProps) {
  const colors = useThemeColors();
  const [draft, setDraft] = useState(initialValue);

  function save() {
    const title = draft.trim();
    if (title) onSave(title);
  }

  return (
    <View style={styles.row}>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={save}
        autoFocus
        maxLength={maxLength}
        returnKeyType="done"
        accessibilityLabel="Name"
        style={[
          styles.input,
          styles.flex,
          { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
        ]}
      />
      <IconButton icon={Check} label="Save name" onPress={save} />
      <IconButton icon={X} label="Cancel edit" onPress={onCancel} />
    </View>
  );
}

interface AddRowProps {
  placeholder: string;
  label: string;
  maxLength: number;
  disabled?: boolean;
  onAdd: (title: string) => void;
}

export function AddRow({ placeholder, label, maxLength, disabled, onAdd }: AddRowProps) {
  const colors = useThemeColors();
  const [value, setValue] = useState("");
  const empty = value.trim() === "";
  const blocked = disabled || empty;

  function submit() {
    const title = value.trim();
    if (!title) return;
    onAdd(title);
    setValue("");
  }

  return (
    <View style={styles.row}>
      <TextInput
        value={value}
        onChangeText={setValue}
        onSubmitEditing={submit}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        accessibilityLabel={label}
        maxLength={maxLength}
        returnKeyType="done"
        editable={!disabled}
        style={[
          styles.input,
          styles.flex,
          { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
        ]}
      />
      <Pressable
        onPress={submit}
        disabled={blocked}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: blocked }}
        style={[styles.addButton, { backgroundColor: colors.primary }, blocked && { opacity: 0.5 }]}
      >
        <Plus size={20} color={colors.primaryForeground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  touch: {
    width: touchTarget,
    height: touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  flex: {
    flex: 1,
  },
  input: {
    minHeight: touchTarget,
    borderWidth: 1,
    borderRadius: shape.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typeScale.body,
  },
  addButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
