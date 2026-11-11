// src/features/language-tester/components/FibFooter.tsx
/** Footer action for the fill-in-the-blank screen: Start on setup, the answer box for an open sentence, then Next. */
import { StyleSheet, View } from "react-native";
import { ArrowRight, ListChecks, Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ErrorText } from "@/components/tool/FormControls";
import { AnswerComposer } from "@/components/tool/AnswerComposer";
import { SAVE_FAILED_MESSAGE } from "../lib/persistence";
import type { FibRound, FibSetup } from "./FibPractice";

export function FibSetupFooter({ setup }: { setup: FibSetup }) {
  return (
    <View style={styles.stack}>
      <ErrorText message={setup.error} />
      <ErrorText message={setup.saveError ? SAVE_FAILED_MESSAGE : null} />
      <ActionButton
        label={setup.pending ? "Writing sentences…" : "Start practice"}
        icon={Sparkles}
        loading={setup.pending}
        onPress={() => void setup.generate()}
      />
    </View>
  );
}

export function FibRoundFooter({ setup, round }: { setup: FibSetup; round: FibRound }) {
  if (round.total === 0) return <FibSetupFooter setup={setup} />;

  const { index, total } = round;
  if (round.feedback[index] === undefined) {
    return (
      <AnswerComposer
        label="Your answer"
        placeholder="Type the missing word…"
        value={round.answers[index] ?? ""}
        maxLength={500}
        pending={round.pendingIndex !== null}
        error={round.error}
        submitLabel="Check answer"
        onChangeText={(text) => round.changeAnswer(index, text)}
        onSubmit={() => void round.check(index)}
      />
    );
  }

  if (index >= total - 1) {
    return <ActionButton label="See all sentences" icon={ListChecks} onPress={() => round.setMode("list")} />;
  }
  return <ActionButton label="Next sentence" icon={ArrowRight} onPress={() => round.goTo(index + 1)} />;
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.sm,
  },
});
