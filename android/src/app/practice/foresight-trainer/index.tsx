// src/app/practice/foresight-trainer/index.tsx
import { useRouter } from "expo-router";
import { Compass, Sparkles } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ResetButton } from "@/components/tool/ResetButton";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { ForesightBoard } from "@/features/foresight-trainer/components/ForesightBoard";
import { ForesightFooter } from "@/features/foresight-trainer/components/ForesightFooter";
import { useForesightRun } from "@/features/foresight-trainer/hooks/useForesightRun";

export default function ForesightTrainerRoute() {
  const router = useRouter();
  const run = useForesightRun();
  const session = run.session;
  const active = session !== null && !session.scenarioComplete;
  const title = active && session ? `Scene ${session.sceneNumber} of ${session.maxScenes}` : "Foresight Trainer";

  return (
    <ToolScreen
      title={title}
      headerRight={<ResetButton onPress={run.reset} accessibilityLabel="Reset scenario" />}
      footer={
        active ? (
          <ForesightFooter run={run} />
        ) : (
          <ActionButton
            label={session ? "Start new scenario" : "Create scenario"}
            icon={Sparkles}
            onPress={() => router.push("/practice/foresight-trainer/new")}
          />
        )
      }
    >
      <Section>
        {session ? (
          <ForesightBoard session={session} run={run} />
        ) : (
          run.loaded && (
            <EmptyHint
              icon={Compass}
              title="No scenario yet"
              hint="Describe a situation you face, and the trainer builds the first scene."
            />
          )
        )}
        {active && (
          <ActionButton
            label="Start a different scenario"
            icon={Sparkles}
            variant="outline"
            onPress={() => router.push("/practice/foresight-trainer/new")}
          />
        )}
      </Section>
    </ToolScreen>
  );
}
