// src/features/tasks/components/DateTimeField.web.tsx
/**
 * Web version of DateTimeField. Uses the browser's own date and date-time inputs, so the same
 * field works in a desktop browser. The native version (DateTimeField.tsx) opens the OS picker.
 */
import { StyleSheet } from "react-native";
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

export function DateTimeField({ label, hint, mode, value, onChange }: DateTimeFieldProps) {
  const colors = useThemeColors();
  const inputType = mode === "date" ? "date" : "datetime-local";
  const min = mode === "date" ? toDateInput(new Date()) : toDateTimeInput(new Date());

  return (
    <Field label={label} hint={hint}>
      <input
        type={inputType}
        aria-label={label}
        min={min}
        value={value ? (mode === "date" ? toDateInput(value) : toDateTimeInput(value)) : ""}
        onChange={(event) => onChange(parseInput(event.target.value, mode))}
        style={{
          ...styles.input,
          color: colors.foreground,
          borderColor: colors.border,
          backgroundColor: colors.background,
        }}
      />
    </Field>
  );
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toDateInput(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toDateTimeInput(date: Date): string {
  return `${toDateInput(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function parseInput(text: string, mode: "date" | "datetime"): Date | null {
  if (!text) return null;
  const [datePart, timePart = "00:00"] = text.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  if (!year || !month || !day) return null;
  if (mode === "date") return new Date(year, month - 1, day);
  return new Date(year, month - 1, day, hours || 0, minutes || 0);
}

const styles = StyleSheet.create({
  input: {
    boxSizing: "border-box",
    width: "100%",
    minHeight: 50,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: radius.lg,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    fontSize: 16,
    fontFamily: "inherit",
  },
});
