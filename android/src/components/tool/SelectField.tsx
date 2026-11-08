// src/components/tool/SelectField.tsx
/**
 * Dropdown with a trailing "Custom" entry. Picking Custom shows a text box so the user can
 * type their own value. The value is always the text that gets sent to the model.
 */
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Check, ChevronDown } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { Field } from "@/components/tool/FormControls";

const CUSTOM = "__custom__";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  customPlaceholder?: string;
  allowCustom?: boolean;
}

export function SelectField({ label, options, value, onChange, customPlaceholder, allowCustom = true }: SelectFieldProps) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(false);
  const [customSelected, setCustomSelected] = useState(false);
  const isPreset = options.some((option) => option.value === value);
  const customMode = !isPreset && (customSelected || value !== "");

  const selectedLabel = customMode
    ? "Custom"
    : (options.find((option) => option.value === value)?.label ?? "Select");

  function pick(choice: string) {
    setOpen(false);
    if (choice === CUSTOM) {
      setCustomSelected(true);
      onChange("");
      return;
    }
    setCustomSelected(false);
    onChange(choice);
  }

  return (
    <Field label={label}>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [
          styles.trigger,
          { borderColor: colors.border, backgroundColor: colors.background },
          pressed && { backgroundColor: colors.muted },
        ]}
      >
        <Text style={[styles.triggerText, { color: colors.foreground }]}>{selectedLabel}</Text>
        <ChevronDown size={18} color={colors.mutedForeground} />
      </Pressable>

      {customMode && (
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={customPlaceholder}
          placeholderTextColor={colors.mutedForeground}
          returnKeyType="done"
          maxLength={100}
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
        />
      )}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => {}}>
            <Text style={[styles.sheetTitle, { color: colors.mutedForeground }]}>{label}</Text>
            <ScrollView style={styles.list}>
              {options.map((option) => {
                const selected = !customMode && option.value === value;
                return (
                  <OptionRow
                    key={String(option.value)}
                    label={option.label}
                    selected={selected}
                    onPress={() => pick(option.value)}
                  />
                );
              })}
              {allowCustom && <OptionRow label="Custom…" selected={customMode} onPress={() => pick(CUSTOM)} />}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </Field>
  );
}

function OptionRow({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.option, pressed && { backgroundColor: colors.muted }]}
    >
      <Text style={[styles.optionText, { color: colors.foreground }, selected && { color: colors.primary, fontWeight: "600" }]}>
        {label}
      </Text>
      {selected && <Check size={18} color={colors.primary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  triggerText: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
  },
  backdrop: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  sheet: {
    borderWidth: 1,
    borderRadius: radius["2xl"],
    padding: spacing.lg,
    maxHeight: 420,
  },
  sheetTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  list: {
    flexGrow: 0,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  optionText: {
    fontSize: 16,
  },
});
