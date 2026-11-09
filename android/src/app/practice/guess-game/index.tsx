// src/app/practice/guess-game/index.tsx
import { ToolScreen } from "@/components/tool/ToolScreen";
import { ResetButton } from "@/components/tool/ResetButton";
import { GuessComposer } from "@/features/guess-game/components/GuessComposer";
import { GuessGameView } from "@/features/guess-game/components/GuessGameView";
import { useGuessGame } from "@/features/guess-game/hooks/useGuessGame";

export default function GuessGameRoute() {
  const game = useGuessGame();
  const session = game.session;
  const playing = session !== null && !session.solved;

  return (
    <ToolScreen title="Guess Game" headerRight={<ResetButton onPress={game.reset} />} footer={playing ? (
      <GuessComposer
        session={session}
        pending={game.pending}
        error={game.error}
        onGuess={(text) => void game.guess(text)}
        onHint={() => void game.getHint()}
        onCoach={() => void game.getCoaching()}
      />
    ) : null}>
      <GuessGameView game={game} />
    </ToolScreen>
  );
}
