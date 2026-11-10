// src/features/roadmap/components/ItemControls.tsx
/** Small controls shared by roadmap rows: done toggle, icon button, inline rename, and add row. */
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Check, Plus, X, type LucideIcon } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";

interface DoneToggleProps {
  done: boolean;
  label: string;
  disabled?: boolean;
  onToggle: () => void;
}

export function DoneToggle({ done, label, disabled, onToggle }: DoneToggleProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: done, disabled }}
      hitSlop={10}
      style={[
        styles.checkbox,
        {
          borderColor: done ? colors.primary : colors.border,
          backgroundColor: done ? colors.primary : colors.background,
        },
      ]}
    >
      {done ? <Check size={14} color={colors.primaryForeground} /> : null}
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
      hitSlop={6}
      style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.6 }, disabled && { opacity: 0.4 }]}
    >
      <Icon size={16} color={colors.mutedForeground} />
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
        style={[
          styles.input,
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
        style={[styles.addButton, { backgroundColor: colors.primary }, blocked && { opacity: 0.5 }]}
      >
        <Plus size={16} color={colors.primaryForeground} />
        <Text style={[styles.addText, { color: colors.primaryForeground }]}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  input: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 40,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
  },
  addText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
