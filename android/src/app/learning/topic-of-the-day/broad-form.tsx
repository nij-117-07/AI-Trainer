// src/app/learning/topic-of-the-day/broad-form.tsx
/** Adds a broader topic, or renames one when an id is passed. Saves, then returns to the list. */
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Save } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { useTopicLibrary } from "@/features/topic-of-the-day/hooks/usePersistedDraft";
import { addBroadTopic, findBroadTopic, renameBroadTopic } from "@/features/topic-of-the-day/lib/library";
import { TOPIC_OF_THE_DAY_LIMITS } from "@/features/topic-of-the-day/options";

export default function BroadTopicFormRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { library, change } = useTopicLibrary();
  const existing = findBroadTopic(library, id);
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const name = draft ?? existing?.name ?? "";

  async function save() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Broader topic is required.");
      return;
    }
    setSaving(true);
    try {
      await change((current) => (existing ? renameBroadTopic(current, existing.id, trimmed) : addBroadTopic(current, trimmed)));
      router.back();
    } catch {
      setError("Could not save. Please try again.");
      setSaving(false);
    }
  }

  return (
    <ToolScreen
      title={existing ? "Edit broader topic" : "New broader topic"}
      usesAi={false}
      footer={
        <View style={styles.footer}>
          <ErrorText message={error} />
          <ActionButton label="Save broader topic" icon={Save} loading={saving} onPress={save} />
        </View>
      }
    >
      <TextField
        label="Broader topic"
        hint={existing ? undefined : "Focused topics are added inside it."}
        placeholder="e.g. Biology, Machine learning, Personal finance"
        value={name}
        onChangeText={(text) => {
          setDraft(text);
          setError(null);
        }}
        editable={!saving}
        maxLength={TOPIC_OF_THE_DAY_LIMITS.broadTopic}
      />
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
});
