/**
 * Feed provider form, on its own page (add or edit). The fields fill the body, including the test
 * button and its preview. The footer holds the error and the one primary save button.
 */
import { StyleSheet, Switch, Text, View } from "react-native";
import { PlugZap, Save } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import type { FeedFormState } from "../../hooks/useFeedForm";
import { FEED_LIMITS } from "../../lib/validation";
import { REFRESH_OPTIONS } from "../../options";

export function FeedFormFields({ form }: { form: FeedFormState }) {
  const colors = useThemeColors();
  const { draft, errors, pending, testing, testError, preview, update } = form;

  return (
    <>
      <TextField
        label="Name"
        placeholder="e.g. Hacker News"
        value={draft.name}
        onChangeText={(text) => update("name", text)}
        editable={!pending}
        maxLength={FEED_LIMITS.name}
      />
      <ErrorText message={errors.name ?? null} />

      <TextField
        label="Feed URL"
        hint="The RSS or Atom address. It must start with https:// or http://."
        placeholder="e.g. https://news.ycombinator.com/rss"
        value={draft.url}
        onChangeText={(text) => update("url", text)}
        editable={!pending}
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <ErrorText message={errors.url ?? null} />
      <ActionButton
        label={testing ? "Testing…" : "Test feed"}
        icon={PlugZap}
        variant="outline"
        loading={testing}
        disabled={pending}
        onPress={() => void form.test()}
      />
      {preview ? (
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          {preview.title} · {preview.itemCount} items
        </Text>
      ) : null}
      <ErrorText message={testError} />

      <TextField
        label="Category"
        hint="Used to group channels in the viewer."
        placeholder="e.g. Tech"
        value={draft.category}
        onChangeText={(text) => update("category", text)}
        editable={!pending}
        maxLength={FEED_LIMITS.category}
      />
      <ErrorText message={errors.category ?? null} />

      <SelectField
        label="Refresh interval"
        options={REFRESH_OPTIONS}
        value={draft.intervalValue}
        onChange={(value) => update("intervalValue", value)}
        allowCustom={false}
      />
      <ErrorText message={errors.refreshIntervalMinutes ?? null} />

      <View style={[styles.switchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.switchText}>
          <Text style={[styles.label, { color: colors.foreground }]}>Enabled</Text>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>Disabled feeds are hidden from the viewer.</Text>
        </View>
        <Switch
          value={draft.enabled}
          onValueChange={(value) => update("enabled", value)}
          disabled={pending}
          accessibilityLabel="Enabled"
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      </View>
    </>
  );
}

export function FeedFormFooter({ form }: { form: FeedFormState }) {
  return (
    <View style={styles.footer}>
      <ErrorText message={form.saveError} />
      <ActionButton
        label={form.pending ? "Saving…" : form.editing ? "Save changes" : "Add feed"}
        icon={Save}
        loading={form.pending}
        onPress={() => void form.save()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  switchText: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
});
