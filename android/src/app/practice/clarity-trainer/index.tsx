// src/app/practice/clarity-trainer/index.tsx
import { useRouter } from "expo-router";
import { MessageSquareText, Sparkles } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { AnswerComposer } from "@/components/tool/AnswerComposer";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { EvaluationPanels } from "@/features/clarity-trainer/components/EvaluationPanels";
import { ScenarioPanel } from "@/features/clarity-trainer/components/ScenarioPanel";
import { useClarityRound } from "@/features/clarity-trainer/hooks/useClarityRound";
import { LIMITS } from "@/features/clarity-trainer/options";

export default function ClarityTrainerRoute() {
  const router = useRouter();
  const game = useClarityRound();
  const round = game.round;
  const reviewed = round?.evaluation != null;
  const active = round !== null && !reviewed;

  return (
    <ToolScreen
      title="Clarity Trainer"
      footer={
        active ? (
          <AnswerComposer
            label="Your response"
            value={round.response}
            placeholder="Write your response…"
            maxLength={LIMITS.response}
            pending={game.busy}
            error={game.error}
            submitLabel="Evaluate"
            onChangeText={game.changeResponse}
            onSubmit={() => void game.submitResponse()}
          />
        ) : (
          <ActionButton
            label="New scenario"
            icon={Sparkles}
            onPress={() => router.push("/practice/clarity-trainer/new")}
          />
        )
      }
    >
      <Section>
        {round ? (
          <>
            <ScenarioPanel round={round} />
            {round.evaluation && <EvaluationPanels evaluation={round.evaluation} />}
            {active && (
              <ActionButton
                label="Start a different scenario"
                icon={Sparkles}
                variant="outline"
                onPress={() => router.push("/practice/clarity-trainer/new")}
              />
            )}
          </>
        ) : (
          game.loaded && (
            <EmptyHint
              icon={MessageSquareText}
              title="No scenario yet"
              hint="Tap New scenario below, choose a difficulty and category, then generate."
            />
          )
        )}
      </Section>
    </ToolScreen>
  );
}
