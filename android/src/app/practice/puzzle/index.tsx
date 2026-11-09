// src/app/practice/puzzle/index.tsx
import { AnswerComposer } from "@/components/tool/AnswerComposer";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { PuzzleScreen } from "@/features/puzzle/components/PuzzleScreen";
import { usePuzzleGame } from "@/features/puzzle/hooks/usePuzzleGame";
import { ANSWER_MAX } from "@/features/puzzle/lib/validate";

export default function PuzzleRoute() {
  const game = usePuzzleGame();
  const round = game.round;
  const attempts = round?.attempts ?? [];
  const solved = attempts.length > 0 && attempts[attempts.length - 1].evaluation.isCorrect;

  return (
    <ToolScreen
      title="Puzzle Generator"
      headerRight={<ResetButton onPress={game.handleReset} />}
      footer={
        round && !solved ? (
          <AnswerComposer
            label="Your answer"
            value={round.userAnswer}
            placeholder={attempts.length > 0 ? "Try a different answer…" : "Your answer…"}
            maxLength={ANSWER_MAX}
            pending={game.evaluate.pending}
            error={game.evaluate.error}
            submitLabel={attempts.length > 0 ? "Check again" : "Submit"}
            onChangeText={game.handleAnswerChange}
            onSubmit={() => void game.handleSubmit()}
          />
        ) : null
      }
    >
      <PuzzleScreen game={game} />
    </ToolScreen>
  );
}
