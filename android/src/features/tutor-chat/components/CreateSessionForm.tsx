// src/features/tutor-chat/components/CreateSessionForm.tsx
/** New tutoring session, pinned to the footer: a master topic and optional background. */
import { ScrollView, StyleSheet, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import type { TutorSettingsValues } from "../lib/types";

interface CreateSessionFormProps {
  form: TutorSettingsValues;
  onChange: (patch: Partial<TutorSettingsValues>) => void;
  onSubmit: () => void;
  creating: boolean;
  error: string | null;
}

export function CreateSessionForm({ form, onChange, onSubmit, creating, error }: CreateSessionFormProps) {
  return (
    <View style={styles.footer}>
      <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent} keyboardShouldPersistTaps="handled">
        <TextField
          label="Master topic"
          placeholder="e.g. Quantum physics"
          value={form.masterTopic}
          onChangeText={(text) => onChange({ masterTopic: text })}
          editable={!creating}
          maxLength={300}
        />
        <TextField
          label="Your background (optional)"
          placeholder="e.g. I know basic algebra and want intuition first"
          value={form.additionalContext}
          onChangeText={(text) => onChange({ additionalContext: text })}
          editable={!creating}
          maxLength={2000}
          multiline
          voice
        />
      </ScrollView>
      <ErrorText message={error} />
      <ActionButton
        label={creating ? "Creating…" : "Start chatting"}
        icon={Sparkles}
        loading={creating}
        onPress={onSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  fields: {
    maxHeight: 340,
  },
  fieldsContent: {
    gap: spacing.md,
  },
});
