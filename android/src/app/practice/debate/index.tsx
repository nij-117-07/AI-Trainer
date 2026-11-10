// src/app/practice/debate/index.tsx
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { Swords } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ResetButton } from "@/components/tool/ResetButton";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { DebateBoard } from "@/features/debate/components/DebateBoard";
import { DebateTurnFooter } from "@/features/debate/components/DebateTurnFooter";
import { useDebateSession } from "@/features/debate/hooks/useDebateSession";

export default function DebateRoute() {
  const router = useRouter();
  const game = useDebateSession();
  const session = game.session;
  const active = session !== null && !session.complete;

  function confirmReset() {
    Alert.alert("Reset this debate?", "The transcript, personas, and verdict will be cleared. This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: game.resetDebate },
    ]);
  }

  return (
    <ToolScreen
      title="Debate Engine"
      headerRight={session ? <ResetButton label="Reset debate" onPress={confirmReset} /> : undefined}
      footer={
        active ? (
          <DebateTurnFooter game={game} />
        ) : (
          <ActionButton label="New debate" icon={Swords} onPress={() => router.push("/practice/debate/new")} />
        )
      }
    >
      <Section>
        {session ? (
          <DebateBoard game={game} session={session} />
        ) : (
          game.loaded && (
            <EmptyHint
              icon={Swords}
              title="No debate yet"
              hint="Tap New debate below, describe the two personas and a topic, then start."
            />
          )
        )}
      </Section>
    </ToolScreen>
  );
}
