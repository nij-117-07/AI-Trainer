// src/features/riddle/components/RiddleTab.tsx
/**
 * Riddle Generator body: the setup form before a round starts, then the active riddle in a scroll
 * box. The answer box and Reset live in the screen (see the route and AnswerComposer).
 */
import { StyleSheet, Text } from "react-native";
import { Sparkles } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { ScrollPanel } from "@/components/tool/ScrollPanel";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { COGNITIVE_DOMAIN_OPTIONS, DIFFICULTY_OPTIONS } from "../options";
import type { useRiddleGame } from "../hooks/useRiddleGame";
import { RiddleRoundView } from "./RiddleRoundView";

interface RiddleTabProps {
  game: ReturnType<typeof useRiddleGame>;
}

export function RiddleTab({ game }: RiddleTabProps) {
  const colors = useThemeColors();
  const { generate, round } = game;

  if (round) {
    return (
      <Section>
        <ScrollPanel scrollKey={round.attempts.length}>
          <RiddleRoundView round={round} showSolution={game.showSolution} onToggleSolution={game.toggleSolution} />
        </ScrollPanel>
      </Section>
    );
  }

  return (
    <Section>
      <Panel>
        <TextField
          label="Topic"
          placeholder="e.g. Space, Ancient Architecture"
          value={game.form.fieldOfInterest}
          onChangeText={(text) => game.updateForm("fieldOfInterest", text)}
          editable={!generate.pending}
          maxLength={200}
        />
        <SelectField
          label="Cognitive Domain"
          options={COGNITIVE_DOMAIN_OPTIONS}
          value={game.form.targetDomain}
          onChange={(value) => game.updateForm("targetDomain", value)}
          allowCustom={false}
        />
        <SelectField
          label="Difficulty"
          options={DIFFICULTY_OPTIONS}
          value={game.form.difficultyLevel}
          onChange={(value) => game.updateForm("difficultyLevel", value)}
          allowCustom={false}
        />
        <ErrorText message={generate.error} />
        <ActionButton
          label={generate.pending ? "Crafting the riddle…" : "Generate riddle"}
          icon={Sparkles}
          loading={generate.pending}
          onPress={game.handleGenerate}
        />
      </Panel>

      <Text style={[styles.empty, { color: colors.mutedForeground }]}>
        No riddle yet. Pick a topic and difficulty, then generate your first riddle.
      </Text>
    </Section>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: spacing.xs,
  },
});
