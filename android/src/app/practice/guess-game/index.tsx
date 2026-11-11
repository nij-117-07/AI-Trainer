// src/app/practice/guess-game/index.tsx
import { useRouter } from "expo-router";
import { Gamepad2, Sparkles } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { AnswerComposer } from "@/components/tool/AnswerComposer";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { confirmAction } from "@/features/chatbot/lib/confirm";
import { GuessGameRoundView } from "@/features/guess-game/components/GuessGameRoundView";
import { useGuessGameRound } from "@/features/guess-game/hooks/useGuessGameRound";
import { GUESS_MAX_LENGTH } from "@/features/guess-game/options";
import { guessesLeft } from "@/features/guess-game/lib/session-model";

export default function GuessGameRoute() {
  const router = useRouter();
  const game = useGuessGameRound();
  const session = game.session;
  const playing = session !== null && !session.solved;

  function openSetup() {
    router.push("/practice/guess-game/new");
  }

  function requestNewGame() {
    if (!session || session.solved || session.attempts.length === 0) {
      openSetup();
      return;
    }
    confirmAction(
      "Start a new game?",
      "Your current game and its guesses will be replaced.",
      openSetup,
      "Start new",
    );
  }

  return (
    <ToolScreen
      title="Guess Game"
      footer={
        playing ? (
          <AnswerComposer
            label="Your guess"
            value={game.draft}
            placeholder={guessesLeft(session) === 0 ? "No guesses left. Keep trying or ask for a hint." : "Make a guess…"}
            maxLength={GUESS_MAX_LENGTH}
            pending={game.pending === "guess"}
            error={game.error}
            submitLabel={session.attempts.length > 0 ? "Guess again" : "Submit"}
            onChangeText={game.changeDraft}
            onSubmit={() => void game.submitGuess()}
          />
        ) : (
          <ActionButton label="New game" icon={Sparkles} onPress={requestNewGame} />
        )
      }
    >
      <Section>
        {session ? (
          <GuessGameRoundView session={session} game={game} onNewGame={requestNewGame} />
        ) : (
          game.loaded && (
            <EmptyHint
              icon={Gamepad2}
              title="No game yet"
              hint="Tap New game, choose a category and difficulty, then start."
            />
          )
        )}
      </Section>
    </ToolScreen>
  );
}
