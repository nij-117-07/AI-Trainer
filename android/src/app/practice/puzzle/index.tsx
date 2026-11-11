// src/app/practice/puzzle/index.tsx
import { useRouter } from "expo-router";
import { Puzzle as PuzzleIcon, Sparkles } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { AnswerComposer } from "@/components/tool/AnswerComposer";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ResetButton } from "@/components/tool/ResetButton";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { PuzzleRoundView } from "@/features/puzzle/components/PuzzleRoundView";
import { usePuzzleRound } from "@/features/puzzle/hooks/usePuzzleRound";
import { ANSWER_MAX } from "@/features/puzzle/lib/validate";

export default function PuzzleRoute() {
  const router = useRouter();
  const game = usePuzzleRound();
  const round = game.round;
  const attempts = round?.attempts ?? [];
  const solved = attempts.length > 0 && attempts[attempts.length - 1].evaluation.isCorrect;
  const active = round !== null && !solved;

  return (
    <ToolScreen
      title="Puzzle Generator"
      headerRight={
        round ? (
          <ResetButton accessibilityLabel="New puzzle" onPress={() => router.push("/practice/puzzle/new")} />
        ) : null
      }
      footer={
        active ? (
          <AnswerComposer
            label="Your answer"
            value={round.userAnswer}
            placeholder={attempts.length > 0 ? "Try a different answer…" : "Your answer…"}
            maxLength={ANSWER_MAX}
            pending={game.evaluate.pending}
            error={game.evaluate.error}
            submitLabel="Submit answer"
            onChangeText={game.changeAnswer}
            onSubmit={() => void game.submitAnswer()}
          />
        ) : (
          <ActionButton
            label={round ? "Next puzzle" : "Start puzzle"}
            icon={Sparkles}
            onPress={() => router.push("/practice/puzzle/new")}
          />
        )
      }
    >
      <Section>
        {round ? (
          <PuzzleRoundView key={round.puzzle.puzzleText} round={round} />
        ) : (
          game.loaded && (
            <EmptyHint
              icon={PuzzleIcon}
              title="No puzzle yet"
              hint="Pick a type and difficulty to begin."
            />
          )
        )}
      </Section>
    </ToolScreen>
  );
}
