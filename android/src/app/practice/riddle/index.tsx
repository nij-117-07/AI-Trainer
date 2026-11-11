// src/app/practice/riddle/index.tsx
import { useRouter } from "expo-router";
import { Brain, Sparkles } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { AnswerComposer } from "@/components/tool/AnswerComposer";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { RiddleRoundView } from "@/features/riddle/components/RiddleRoundView";
import { useRiddleRound } from "@/features/riddle/hooks/useRiddleRound";

export default function RiddleRoute() {
  const router = useRouter();
  const game = useRiddleRound();
  const round = game.round;
  const attempts = round?.attempts ?? [];
  const solved = attempts.length > 0 && attempts[attempts.length - 1].evaluation.isCorrect;
  const active = round !== null && !solved;

  return (
    <ToolScreen
      title="Riddle Generator"
      footer={
        active ? (
          <AnswerComposer
            label="Your answer"
            value={round.userAnswer}
            placeholder={attempts.length > 0 ? "Try a different answer…" : "Your answer…"}
            maxLength={2000}
            pending={game.evaluate.pending}
            error={game.evaluate.error}
            submitLabel="Submit guess"
            onChangeText={game.changeAnswer}
            onSubmit={() => void game.submitAnswer()}
          />
        ) : (
          <ActionButton
            label={round ? "Next riddle" : "New riddle"}
            icon={Sparkles}
            onPress={() => router.push("/practice/riddle/new")}
          />
        )
      }
    >
      <Section>
        {round ? (
          <>
            <RiddleRoundView
              key={round.riddle.riddleText}
              round={round}
              showSolution={game.showSolution}
              onToggleSolution={game.toggleSolution}
            />
            {active && (
              <ActionButton
                label="New riddle"
                icon={Sparkles}
                variant="outline"
                onPress={() => router.push("/practice/riddle/new")}
              />
            )}
          </>
        ) : (
          game.loaded && <EmptyHint icon={Brain} title="No riddle yet" hint="Pick a topic and difficulty to begin." />
        )}
      </Section>
    </ToolScreen>
  );
}
