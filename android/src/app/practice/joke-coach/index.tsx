// src/app/practice/joke-coach/index.tsx
import { useRouter } from "expo-router";
import { Laugh, Sparkles } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { AnswerComposer } from "@/components/tool/AnswerComposer";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { confirmAction } from "@/features/chatbot/lib/confirm";
import { JokeLabRoundView } from "@/features/joke-coach/components/JokeLabRoundView";
import { useJokeLabRound } from "@/features/joke-coach/hooks/useJokeLabRound";
import { JOKE_MAX } from "@/features/joke-coach/lib/validate";

export default function JokeLabRoute() {
  const router = useRouter();
  const game = useJokeLabRound();
  const round = game.round;

  function openSetup() {
    router.push("/practice/joke-coach/new");
  }

  function requestNewScenario() {
    if (!round || round.attempts.length === 0) {
      openSetup();
      return;
    }
    confirmAction(
      "Start a new scenario?",
      "Your current joke and its scores will be replaced.",
      openSetup,
      "Start new",
    );
  }

  return (
    <ToolScreen
      title="Joke Coach"
      footer={
        round ? (
          <AnswerComposer
            label="Your joke"
            value={round.draft}
            placeholder="Write a joke for this scenario…"
            maxLength={JOKE_MAX}
            pending={game.pending === "evaluate"}
            error={game.error}
            submitLabel={round.attempts.length > 0 ? "Resubmit joke" : "Submit joke"}
            onChangeText={game.changeDraft}
            onSubmit={() => void game.submitJoke()}
          />
        ) : (
          <ActionButton label="New scenario" icon={Sparkles} onPress={openSetup} />
        )
      }
    >
      <Section>
        {round ? (
          <JokeLabRoundView round={round} game={game} onNewScenario={requestNewScenario} />
        ) : (
          game.loaded && (
            <EmptyHint
              icon={Laugh}
              title="No scenario yet"
              hint="Get a scenario to write a joke for."
            />
          )
        )}
      </Section>
    </ToolScreen>
  );
}
