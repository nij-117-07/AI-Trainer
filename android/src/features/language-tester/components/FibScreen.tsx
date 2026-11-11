// src/features/language-tester/components/FibScreen.tsx
/** Fill-in-the-blank page: the setup form, or the sentence round it generated, with one footer action per stage. */
import { StyleSheet, View } from "react-native";
import { SlidersHorizontal, X } from "lucide-react-native";
import { spacing } from "@/theme";
import { ErrorText } from "@/components/tool/FormControls";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { SAVE_FAILED_MESSAGE } from "../lib/persistence";
import type { FibResult } from "../types";
import { FibQuiz, FibIconButton } from "./FibQuiz";
import { FibRoundFooter, FibSetupFooter } from "./FibFooter";
import { FibTab } from "./FibTab";
import { ToolSlotFill } from "./ToolSlotFill";
import { useFibRound, type FibSetup } from "./FibPractice";

export function FibScreen({ setup }: { setup: FibSetup }) {
  if (setup.setupOpen || !setup.result) return <SetupScreen setup={setup} />;
  return <RoundScreen key={setup.runKey} setup={setup} result={setup.result} />;
}

function SetupScreen({ setup }: { setup: FibSetup }) {
  return (
    <ToolScreen title="Fill in the Blank" wide>
      <ToolSlotFill
        footer={<FibSetupFooter setup={setup} />}
        headerRight={
          <View style={styles.actions}>
            {setup.result && (
              <FibIconButton icon={X} label="Close setup" onPress={() => setup.setSetupOpen(false)} />
            )}
            <ResetButton onPress={setup.reset} accessibilityLabel="Reset form and results" />
          </View>
        }
      />
      <FibTab setup={setup} />
    </ToolScreen>
  );
}

function RoundScreen({ setup, result }: { setup: FibSetup; result: FibResult }) {
  const round = useFibRound(result);
  const showFooter = round.mode === "step" || round.total === 0;
  const busy = round.pendingIndex !== null;

  return (
    <ToolScreen title="Fill in the Blank" wide>
      <ToolSlotFill
        footer={showFooter ? <FibRoundFooter setup={setup} round={round} /> : null}
        headerRight={
          <View style={styles.actions}>
            <FibIconButton icon={SlidersHorizontal} label="Open setup" disabled={busy} onPress={() => setup.setSetupOpen(true)} />
            <ResetButton onPress={setup.reset} accessibilityLabel="Reset form and results" />
          </View>
        }
      />
      <ErrorText message={setup.saveError ? SAVE_FAILED_MESSAGE : null} />
      <FibQuiz round={round} />
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
