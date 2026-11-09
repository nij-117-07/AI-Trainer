// src/features/tasks/components/DateTimeField.tsx
/**
 * Field that opens the native date or date-and-time picker. On Android the date dialog opens first and
 * the time dialog follows. On iOS the spinner opens inline below the field.
 */
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { CalendarClock, X } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { Field } from "@/components/tool/FormControls";

interface DateTimeFieldProps {
  label: string;
  hint?: string;
  mode: "date" | "datetime";
  value: Date | null;
  placeholder: string;
  onChange: (value: Date | null) => void;
}

type Step = "date" | "time" | "inline" | null;

export function DateTimeField({ label, hint, mode, value, placeholder, onChange }: DateTimeFieldProps) {
  const colors = useThemeColors();
  const [step, setStep] = useState<Step>(null);
  const [pending, setPending] = useState<Date | null>(null);
  const current = value ?? defaultValue(mode);
  const web = Platform.OS === "web";

  function open() {
    if (web) return;
    setPending(current);
    if (Platform.OS === "ios") {
      setStep((prev) => (prev ? null : "inline"));
      return;
    }
    setStep("date");
  }

  function onDateEvent(event: DateTimePickerEvent, picked?: Date) {
    if (event.type !== "set" || !picked) {
      setStep(null);
      return;
    }
    if (mode === "date") {
      onChange(startOfDay(picked));
      setStep(null);
      return;
    }
    setPending(picked);
    setStep("time");
  }

  function onTimeEvent(event: DateTimePickerEvent, picked?: Date) {
    if (event.type !== "set" || !picked || !pending) {
      setStep(null);
      return;
    }
    onChange(
      new Date(pending.getFullYear(), pending.getMonth(), pending.getDate(), picked.getHours(), picked.getMinutes())
    );
    setStep(null);
  }

  function onInlineEvent(picked?: Date) {
    if (picked) onChange(mode === "date" ? startOfDay(picked) : picked);
  }

  return (
    <Field label={label} hint={hint}>
      <View style={styles.wrap}>
        <Pressable
          onPress={open}
          disabled={web}
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${value ? formatValue(value, mode) : placeholder}`}
          accessibilityState={{ disabled: web }}
          style={({ pressed }) => [
            styles.field,
            { borderColor: colors.border, backgroundColor: colors.background },
            pressed && !web && { opacity: 0.85 },
          ]}
        >
          <CalendarClock size={18} color={colors.mutedForeground} />
          <Text style={[styles.text, { color: value ? colors.foreground : colors.mutedForeground }]}>
            {value ? formatValue(value, mode) : web ? "Pick in the Android app" : placeholder}
          </Text>
          {value && !web ? (
            <Pressable
              onPress={() => onChange(null)}
              accessibilityRole="button"
              accessibilityLabel={`Clear ${label.toLowerCase()}`}
              hitSlop={10}
            >
              <X size={18} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </Pressable>

        {step === "date" ? (
          <DateTimePicker value={pending ?? current} mode="date" minimumDate={startOfDay(new Date())} onChange={onDateEvent} />
        ) : null}
        {step === "time" ? <DateTimePicker value={pending ?? current} mode="time" onChange={onTimeEvent} /> : null}
        {step === "inline" ? (
          <View style={[styles.inline, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <DateTimePicker
              value={current}
              mode={mode === "date" ? "date" : "datetime"}
              display="spinner"
              minimumDate={startOfDay(new Date())}
              onChange={(_event, picked) => onInlineEvent(picked)}
            />
          </View>
        ) : null}
      </View>
    </Field>
  );
}

function defaultValue(mode: "date" | "datetime"): Date {
  if (mode === "date") return new Date();
  const next = new Date(Date.now() + 60 * 60 * 1000);
  next.setMinutes(0, 0, 0);
  return next;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatValue(date: Date, mode: "date" | "datetime"): string {
  if (mode === "date") {
    return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  }
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 50,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  text: {
    flex: 1,
    fontSize: 16,
  },
  inline: {
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
});
