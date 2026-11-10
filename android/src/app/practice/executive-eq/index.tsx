// src/app/practice/executive-eq/index.tsx
import { useRouter } from "expo-router";
import { Briefcase } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { AnswerComposer } from "@/components/tool/AnswerComposer";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ResetButton } from "@/components/tool/ResetButton";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { SimulationBoard } from "@/features/executive-eq/components/SimulationBoard";
import { useExecutiveEqSession } from "@/features/executive-eq/hooks/useExecutiveEqSession";

export default function ExecutiveEqRoute() {
  const router = useRouter();
  const game = useExecutiveEqSession();
  const session = game.session;

  return (
    <ToolScreen
      title="Executive EQ Trainer"
      headerRight={<ResetButton onPress={game.reset} />}
      footer={
        session ? (
          <AnswerComposer
            label="Your response (each reply is graded)"
            value={game.message}
            placeholder="Say it without saying it…"
            maxLength={2000}
            pending={game.busy}
            error={game.error}
            submitLabel="Send"
            onChangeText={game.setMessage}
            onSubmit={() => void game.send()}
          />
        ) : (
          <ActionButton
            label="New simulation"
            icon={Briefcase}
            onPress={() => router.push("/practice/executive-eq/new")}
          />
        )
      }
    >
      <Section>
        {session ? (
          <>
            <SimulationBoard session={session} busy={game.busy} />
            <ActionButton
              label="Start a different simulation"
              icon={Briefcase}
              variant="outline"
              onPress={() => router.push("/practice/executive-eq/new")}
            />
          </>
        ) : (
          game.loaded && (
            <EmptyHint
              icon={Briefcase}
              title="No simulation yet"
              hint="Tap New simulation below, describe your role and goal, then enter the boardroom."
            />
          )
        )}
      </Section>
    </ToolScreen>
  );
}
