// src/features/challenges/components/ChallengeForm.tsx
/** Challenge Giver form page: the fields in the body, and Give challenges in the footer. */
import { StyleSheet, View } from "react-native";
import { ArrowLeft, Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ChoiceChips, ErrorText, Field, TextField } from "@/components/tool/FormControls";
import { CountSlider } from "@/components/tool/CountSlider";
import type { ChallengeGiverState } from "../hooks/useChallengeGiver";
import { challengeLevelOptions, challengeTimeOptions, challengeTypeOptions } from "../options";
import { INSTRUCTIONS_MAX, MAX_CHALLENGES, TOPIC_MAX } from "../lib/validate";

export function ChallengeFormBody({ giver }: { giver: ChallengeGiverState }) {
  const { form, pending, update } = giver;

  return (
    <View style={styles.body}>
      <TextField
        label="Topic or skill"
        placeholder="e.g. Python list comprehensions"
        value={form.topic}
        onChangeText={(text) => update("topic", text)}
        editable={!pending}
        maxLength={TOPIC_MAX}
      />
      <Field label="Challenge type">
        <ChoiceChips options={challengeTypeOptions} value={form.challengeType} onChange={(value) => update("challengeType", value)} />
      </Field>
      <Field label="Skill level">
        <ChoiceChips options={challengeLevelOptions} value={form.skillLevel} onChange={(value) => update("skillLevel", value)} />
      </Field>
      <Field label="Time available">
        <ChoiceChips options={challengeTimeOptions} value={form.timeMinutes} onChange={(value) => update("timeMinutes", value)} />
      </Field>
      <CountSlider
        label="Number of challenges"
        min={1}
        max={MAX_CHALLENGES}
        value={form.numChallenges}
        onChange={(value) => update("numChallenges", value)}
      />
      <TextField
        label="Instructions (optional)"
        placeholder="e.g. Use only the standard library"
        value={form.instructions}
        onChangeText={(text) => update("instructions", text)}
        editable={!pending}
        maxLength={INSTRUCTIONS_MAX}
        multiline
        voice
      />
    </View>
  );
}

export function ChallengeFormFooter({ giver, onBack }: { giver: ChallengeGiverState; onBack?: () => void }) {
  const { pending, error, saveError, give } = giver;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ErrorText message={saveError} />
      <ActionButton
        label={pending ? "Creating challenges…" : "Give challenges"}
        icon={Sparkles}
        loading={pending}
        onPress={give}
      />
      {onBack ? (
        <ActionButton label="Back to challenges" icon={ArrowLeft} variant="outline" disabled={pending} onPress={onBack} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.lg,
  },
  footer: {
    gap: spacing.sm,
  },
});
