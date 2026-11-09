// src/app/practice/riddle/index.tsx
import { AnswerComposer } from "@/components/tool/AnswerComposer";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { RiddleTab } from "@/features/riddle/components/RiddleTab";
import { useRiddleGame } from "@/features/riddle/hooks/useRiddleGame";

export default function RiddleRoute() {
  const game = useRiddleGame();
  const round = game.round;
  const attempts = round?.attempts ?? [];
  const solved = attempts.length > 0 && attempts[attempts.length - 1].evaluation.isCorrect;

  return (
    <ToolScreen
      title="Riddle Generator"
      headerRight={<ResetButton onPress={game.handleReset} />}
      footer={
        round && !solved ? (
          <AnswerComposer
            label="Your answer"
            value={round.userAnswer}
            placeholder={attempts.length > 0 ? "Try a different answer…" : "Your answer (or ask for a hint)…"}
            maxLength={2000}
            pending={game.evaluate.pending}
            error={game.evaluate.error}
            submitLabel={attempts.length > 0 ? "Check again" : "Submit"}
            onChangeText={game.handleAnswerChange}
            onSubmit={() => void game.handleSubmitAnswer()}
          />
        ) : null
      }
    >
      <RiddleTab game={game} />
    </ToolScreen>
  );
}
