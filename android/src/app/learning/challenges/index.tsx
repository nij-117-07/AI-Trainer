// src/app/learning/challenges/index.tsx
import { useEffect, useState } from "react";
import { View } from "react-native";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { spacing } from "@/theme";
import { ChallengeFormBody, ChallengeFormFooter } from "@/features/challenges/components/ChallengeForm";
import { ChallengeResults, ChallengeResultsFooter, EditFormButton } from "@/features/challenges/components/ChallengeResults";
import { useChallengeGiver } from "@/features/challenges/hooks/useChallengeGiver";

export default function ChallengesRoute() {
  const giver = useChallengeGiver();
  const { result, form, toggleKept } = giver;
  const [editing, setEditing] = useState(false);
  const shown = result && !editing ? result : null;

  useEffect(() => {
    setEditing(false);
  }, [result]);

  return (
    <ToolScreen
      title="Challenge Giver"
      headerRight={
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
          {shown ? <EditFormButton onPress={() => setEditing(true)} /> : null}
          <ResetButton onPress={giver.reset} accessibilityLabel="Reset form and challenges" />
        </View>
      }
      footer={
        shown ? (
          <ChallengeResultsFooter giver={giver} />
        ) : (
          <ChallengeFormFooter giver={giver} onBack={result ? () => setEditing(false) : undefined} />
        )
      }
    >
      {shown ? (
        <ChallengeResults
          result={shown}
          challengeType={form.challengeType}
          skillLevel={form.skillLevel}
          onToggleKept={toggleKept}
        />
      ) : (
        <ChallengeFormBody giver={giver} />
      )}
    </ToolScreen>
  );
}
