/**
 * Reminder form, on its own page. The fields fill the body. The footer holds the error and the one
 * primary add button. A successful add saves the reminder and returns to the list.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Plus } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ChoiceChips, ErrorText, Field, TextField } from "@/components/tool/FormControls";
import type { ReminderFormState } from "../hooks/useReminderForm";
import { UNIT_OPTIONS, WEEKDAY_ORDER } from "../lib/labels";
import { NAME_MAX, UNIT_LIMITS } from "../lib/validate";

export function ReminderFormFields({ form }: { form: ReminderFormState }) {
  const colors = useThemeColors();
  const { draft, pending, update, toggleDay } = form;
  const limits = UNIT_LIMITS[draft.unit];

  return (
    <>
      <TextField
        label="What to remember"
        placeholder="e.g. Drink water"
        value={draft.name}
        onChangeText={(text) => update("name", text)}
        maxLength={NAME_MAX}
        editable={!pending}
      />
      <TextField
        label="Repeat every"
        placeholder="e.g. 2"
        hint={`Allowed: ${limits.min} to ${limits.max} ${draft.unit}.`}
        value={draft.every}
        onChangeText={(text) => update("every", text)}
        keyboardType="number-pad"
        maxLength={4}
        editable={!pending}
      />
      <Field label="Unit">
        <ChoiceChips options={UNIT_OPTIONS} value={draft.unit} onChange={(value) => update("unit", value)} wrap={false} />
      </Field>
      <View style={styles.row}>
        <View style={styles.grow}>
          <TextField
            label="Active from"
            placeholder="09:00"
            value={draft.windowStart}
            onChangeText={(text) => update("windowStart", text)}
            maxLength={5}
            editable={!pending}
          />
        </View>
        <View style={styles.grow}>
          <TextField
            label="Active until"
            placeholder="21:00"
            value={draft.windowEnd}
            onChangeText={(text) => update("windowEnd", text)}
            maxLength={5}
            editable={!pending}
          />
        </View>
      </View>
      <Text style={[styles.hint, { color: colors.mutedForeground }]}>
        24-hour time. Reminders only fire inside this window. A window like 22:00 to 06:00 is allowed.
      </Text>
      <Field label="Days">
        <View style={styles.days}>
          {WEEKDAY_ORDER.map((day) => {
            const selected = draft.weekdays.includes(day.value);
            return (
              <Pressable
                key={day.value}
                onPress={() => toggleDay(day.value)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected, disabled: pending }}
                accessibilityLabel={day.label}
                disabled={pending}
                style={[
                  styles.day,
                  { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primary : colors.card },
                ]}
              >
                <Text style={[styles.dayText, { color: selected ? colors.primaryForeground : colors.foreground }]}>{day.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </Field>
    </>
  );
}

export function ReminderFormFooter({ form }: { form: ReminderFormState }) {
  return (
    <View style={styles.footer}>
      <ErrorText message={form.error} />
      <ActionButton
        label={form.pending ? "Adding…" : "Add reminder"}
        icon={Plus}
        loading={form.pending}
        onPress={() => void form.add()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  grow: {
    flex: 1,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  days: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  day: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dayText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
