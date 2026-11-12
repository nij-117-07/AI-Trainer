// src/app/practice/debate/index.tsx
import { useRouter } from "expo-router";
import { Swords } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { DebateBoard } from "@/features/debate/components/DebateBoard";
import { DebateHeaderActions } from "@/features/debate/components/DebateHeaderActions";
import { DebateSidebar } from "@/features/debate/components/DebateSidebar";
import { DebateTurnFooter } from "@/features/debate/components/DebateTurnFooter";
import { useDebateSession } from "@/features/debate/hooks/useDebateSession";

export default function DebateRoute() {
  const router = useRouter();
  const game = useDebateSession();
  const session = game.session;
  const active = session !== null && !session.complete;

  return (
    <ToolScreen
      title="Debate Engine"
      subtitle={session?.topic}
      sidebar={session ? <DebateSidebar game={game} session={session} /> : undefined}
      headerRight={session ? <DebateHeaderActions game={game} session={session} /> : undefined}
      fill
      footer={
        active ? (
          <DebateTurnFooter game={game} />
        ) : (
          <ActionButton label="New debate" icon={Swords} onPress={() => router.push("/practice/debate/new")} />
        )
      }
    >
      {session ? (
        <DebateBoard game={game} session={session} />
      ) : (
        game.loaded && (
          <EmptyHint icon={Swords} title="No debate yet" hint="Build two personas and a topic, then argue against the AI." />
        )
      )}
    </ToolScreen>
  );
}
