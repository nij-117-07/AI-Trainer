// src/features/puzzle/components/PuzzleScreen.tsx
/**
 * Puzzle Generator body: the setup form before a round starts, then the round in a scroll box. The
 * answer box and Reset live in the screen (see the route and AnswerComposer).
 */
import { Puzzle as PuzzleIcon } from "lucide-react-native";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { ScrollPanel } from "@/components/tool/ScrollPanel";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { COGNITIVE_DOMAIN_OPTIONS, DIFFICULTY_OPTIONS, PUZZLE_TYPE_OPTIONS } from "../options";
import { TOPIC_MAX } from "../lib/validate";
import type { usePuzzleGame } from "../hooks/usePuzzleGame";
import type { CognitiveDomain, DifficultyLevel, PuzzleType } from "../types";
import { PuzzleRoundView } from "./PuzzleRoundView";
import { EmptyNote } from "./ResultParts";

interface PuzzleScreenProps {
  game: ReturnType<typeof usePuzzleGame>;
}

export function PuzzleScreen({ game }: PuzzleScreenProps) {
  const { form, round, generate, evaluate } = game;
  const busy = generate.pending || evaluate.pending;

  if (round) {
    return (
      <Section>
        <ScrollPanel scrollKey={round.attempts.length}>
          <PuzzleRoundView key={round.puzzle.puzzleText} round={round} />
        </ScrollPanel>
      </Section>
    );
  }

  return (
    <Section>
      <Panel>
        <TextField
          label="Field of interest"
          placeholder="e.g. Cyberpunk, Ancient Egypt, Quantum Physics"
          value={form.fieldOfInterest}
          onChangeText={(text) => game.update("fieldOfInterest", text)}
          editable={!busy}
          maxLength={TOPIC_MAX}
        />
        <SelectField
          label="Puzzle type"
          options={PUZZLE_TYPE_OPTIONS}
          value={form.puzzleType}
          onChange={(value) => game.update("puzzleType", value as PuzzleType)}
          allowCustom={false}
        />
        <SelectField
          label="Cognitive domain"
          options={COGNITIVE_DOMAIN_OPTIONS}
          value={form.targetDomain}
          onChange={(value) => game.update("targetDomain", value as CognitiveDomain)}
          allowCustom={false}
        />
        <SelectField
          label="Difficulty"
          options={DIFFICULTY_OPTIONS}
          value={form.difficultyLevel}
          onChange={(value) => game.update("difficultyLevel", value as DifficultyLevel)}
          allowCustom={false}
        />
        <ErrorText message={generate.error} />
        <ActionButton
          label={generate.pending ? "Crafting the puzzle…" : "Generate puzzle"}
          icon={PuzzleIcon}
          loading={generate.pending}
          onPress={() => void game.handleGenerate()}
        />
      </Panel>

      <EmptyNote message="Pick a topic, puzzle type, and difficulty, then generate your first puzzle." />
    </Section>
  );
}
