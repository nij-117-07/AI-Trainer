// src/app/practice/negotiation/index.tsx
import { useRouter } from "expo-router";
import { Handshake } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { AnswerComposer } from "@/components/tool/AnswerComposer";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ResetButton } from "@/components/tool/ResetButton";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { NegotiationBoard } from "@/features/negotiation/components/NegotiationBoard";
import { useNegotiationSession } from "@/features/negotiation/hooks/useNegotiationSession";
import { MESSAGE_MAX, OUTCOME_MAX } from "@/features/negotiation/lib/validate";

export default function NegotiationRoute() {
  const router = useRouter();
  const game = useNegotiationSession();
  const session = game.session;
  const active = session !== null && !session.complete;

  return (
    <ToolScreen
      title="Negotiation Practice"
      headerRight={<ResetButton onPress={game.reset} accessibilityLabel="Reset negotiation" />}
      footer={
        active ? (
          <AnswerComposer
            label={game.ending ? "How did the negotiation end?" : "Your reply"}
            value={game.ending ? game.outcome : game.message}
            placeholder={
              game.ending ? "e.g. agreement at $165k base plus two remote days" : "Say something to the opponent…"
            }
            maxLength={game.ending ? OUTCOME_MAX : MESSAGE_MAX}
            pending={game.busy}
            error={game.error}
            submitLabel={game.ending ? "Evaluate outcome" : "Send reply"}
            onChangeText={game.ending ? game.setOutcome : game.setMessage}
            onSubmit={() => void (game.ending ? game.finish() : game.send())}
          />
        ) : (
          <ActionButton
            label="New negotiation"
            icon={Handshake}
            onPress={() => router.push("/practice/negotiation/new")}
          />
        )
      }
    >
      <Section>
        {session ? (
          <>
            <NegotiationBoard
              session={session}
              busy={game.busy}
              ending={game.ending}
              onEnd={() => game.setEnding(true)}
              onKeepNegotiating={() => game.setEnding(false)}
            />
            {active && (
              <ActionButton
                label="Start a different negotiation"
                icon={Handshake}
                variant="outline"
                onPress={() => router.push("/practice/negotiation/new")}
              />
            )}
          </>
        ) : (
          game.loaded && (
            <EmptyHint
              icon={Handshake}
              title="No negotiation yet"
              hint="Pick a topic and difficulty to begin."
            />
          )
        )}
      </Section>
    </ToolScreen>
  );
}
