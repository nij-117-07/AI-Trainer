// src/app/practice/battleground/index.tsx
import { useRouter } from "expo-router";
import { Swords } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { BattleBoard, BattleMoveFooter } from "@/features/battleground/components/BattleBoard";
import { BattleSidebar } from "@/features/battleground/components/BattleSidebar";
import { useBattleSession } from "@/features/battleground/hooks/useBattleSession";

export default function BattlegroundRoute() {
  const router = useRouter();
  const battle = useBattleSession();
  const session = battle.session;
  const active = session !== null && session.isActive;

  return (
    <ToolScreen
      title="Battleground Simulator"
      subtitle={session ? `${session.topic} · Round ${session.roundNumber}` : undefined}
      sidebar={session ? <BattleSidebar session={session} /> : undefined}
      headerRight={session ? <ResetButton accessibilityLabel="Reset battle" onPress={battle.reset} /> : undefined}
      fill
      footer={
        active ? (
          <BattleMoveFooter battle={battle} />
        ) : (
          <ActionButton label="New battle" icon={Swords} onPress={() => router.push("/practice/battleground/new")} />
        )
      }
    >
      {session ? (
        <BattleBoard session={session} pending={battle.pending} />
      ) : (
        battle.loaded && (
          <EmptyHint icon={Swords} title="No battle yet" hint="Pick a topic and difficulty to face an AI opponent." />
        )
      )}
    </ToolScreen>
  );
}
