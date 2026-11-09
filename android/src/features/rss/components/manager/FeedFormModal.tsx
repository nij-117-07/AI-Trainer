// src/features/rss/components/manager/FeedFormModal.tsx
/** Add or edit form for a feed provider. Validates on the device, previews a candidate URL, and hands the result to the parent to save. */
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PlugZap, X } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { messageOf } from "../../lib/errors";
import { fetchFeed } from "../../lib/fetch-feed";
import { DEFAULT_REFRESH_MINUTES, REFRESH_OPTIONS } from "../../options";
import { FEED_LIMITS, isHttpUrl, validateFeedInput, type FeedInputErrors } from "../../lib/validation";
import type { RssFeedConfig, RssFeedInput } from "../../types";

interface FeedFormModalProps {
  visible: boolean;
  feed: RssFeedConfig | null;
  busy: boolean;
  onClose: () => void;
  onSave: (input: RssFeedInput) => Promise<void>;
}

interface Preview {
  title: string;
  itemCount: number;
}

export function FeedFormModal({ visible, feed, busy, onClose, onSave }: FeedFormModalProps) {
  const colors = useThemeColors();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [intervalValue, setIntervalValue] = useState(String(DEFAULT_REFRESH_MINUTES));
  const [enabled, setEnabled] = useState(true);
  const [errors, setErrors] = useState<FeedInputErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName(feed?.name ?? "");
    setUrl(feed?.url ?? "");
    setCategory(feed?.category ?? "General");
    setIntervalValue(String(feed?.refreshIntervalMinutes ?? DEFAULT_REFRESH_MINUTES));
    setEnabled(feed?.enabled ?? true);
    setErrors({});
    setSaveError(null);
    setTestError(null);
    setPreview(null);
  }, [visible, feed]);

  async function handleTest() {
    const target = url.trim();
    setPreview(null);
    setTestError(null);
    if (!isHttpUrl(target)) {
      setTestError("Enter a valid URL to test.");
      return;
    }
    setTesting(true);
    try {
      const result = await fetchFeed(
        { id: "preview", name: "Preview", url: target, refreshIntervalMinutes: DEFAULT_REFRESH_MINUTES },
        { bypassCache: true, persist: false },
      );
      setPreview({ title: result.source.title || "Untitled feed", itemCount: result.items.length });
    } catch (cause) {
      setTestError(messageOf(cause, "Could not fetch the feed."));
    } finally {
      setTesting(false);
    }
  }

  async function handleSave() {
    const checked = validateFeedInput({
      name,
      url,
      category,
      enabled,
      refreshIntervalMinutes: Number(intervalValue),
    });
    if (!checked.ok) {
      setErrors(checked.errors);
      return;
    }
    setErrors({});
    setSaveError(null);
    try {
      await onSave(checked.value);
    } catch (cause) {
      setSaveError(messageOf(cause, "Could not save the feed."));
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={["top", "left", "right", "bottom"]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {feed ? "Edit feed provider" : "Add feed provider"}
          </Text>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={[styles.closeButton, { borderColor: colors.border }]}
          >
            <X size={18} color={colors.foreground} />
          </Pressable>
        </View>

        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              Configure an RSS or Atom source. Test it before saving to confirm it parses correctly.
            </Text>

            <TextField
              label="Name"
              placeholder="e.g. Hacker News"
              value={name}
              onChangeText={setName}
              editable={!busy}
              maxLength={FEED_LIMITS.name}
            />
            <ErrorText message={errors.name ?? null} />

            <TextField
              label="Feed URL"
              placeholder="https://news.ycombinator.com/rss"
              value={url}
              onChangeText={setUrl}
              editable={!busy}
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
              onPress={handleTest}
            />
            {preview ? (
              <Text style={[styles.description, { color: colors.mutedForeground }]}>
                {preview.title} · {preview.itemCount} items
              </Text>
            ) : null}
            <ErrorText message={testError} />

            <TextField
              label="Category"
              placeholder="e.g. Tech"
              value={category}
              onChangeText={setCategory}
              editable={!busy}
              maxLength={FEED_LIMITS.category}
            />
            <ErrorText message={errors.category ?? null} />

            <SelectField
              label="Refresh interval"
              options={REFRESH_OPTIONS}
              value={intervalValue}
              onChange={setIntervalValue}
              allowCustom={false}
            />
            <ErrorText message={errors.refreshIntervalMinutes ?? null} />

            <View style={[styles.switchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.switchText}>
                <Text style={[styles.label, { color: colors.foreground }]}>Enabled</Text>
                <Text style={[styles.description, { color: colors.mutedForeground }]}>
                  Disabled feeds are hidden from the viewer.
                </Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={setEnabled}
                disabled={busy}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            <ErrorText message={saveError} />
            <ActionButton label={feed ? "Save changes" : "Add feed"} loading={busy} onPress={handleSave} />
            <ActionButton label="Cancel" variant="outline" onPress={onClose} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    flexShrink: 1,
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing["2xl"],
    gap: spacing.lg,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
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
