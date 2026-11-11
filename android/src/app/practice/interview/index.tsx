// src/app/practice/interview/index.tsx
import { StyleSheet, View } from "react-native";
import { Square } from "lucide-react-native";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { spacing } from "@/theme";
import { InterviewFooter } from "@/features/interview/components/InterviewFooter";
import { InterviewView } from "@/features/interview/components/InterviewView";
import { IconAction } from "@/features/interview/components/StagePanel";
import { useInterviewScreen } from "@/features/interview/hooks/useInterviewScreen";
import type { InterviewSessionState } from "@/features/interview/types";

function pageTitle(state: InterviewSessionState | null): string {
  if (!state) return "Interview Simulator";
  if (state.stage === "report") return "Final report";
  const current = Math.min(state.questionsAsked + 1, state.setup.maxQuestions);
  return `Question ${current} of ${state.setup.maxQuestions}`;
}

export default function InterviewRoute() {
  const screen = useInterviewScreen();
  const { state, pending } = screen;
  const inProgress = state !== null && state.stage !== "report";

  return (
    <ToolScreen
      title={pageTitle(state)}
      headerRight={
        <View style={styles.actions}>
          {inProgress ? (
            <IconAction
              icon={Square}
              label="End interview"
              disabled={pending !== null}
              onPress={screen.endInterview}
            />
          ) : null}
          <ResetButton onPress={screen.reset} accessibilityLabel="Reset interview" />
        </View>
      }
      footer={<InterviewFooter screen={screen} />}
    >
      <InterviewView screen={screen} />
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
});
