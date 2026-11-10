// src/app/practice/testing-portal/grader/index.tsx
import { useRouter } from "expo-router";
import { ShieldCheck } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { GraderResultView } from "@/features/testing-portal/components/GraderResultView";
import { useGraderResult } from "@/features/testing-portal/hooks/useGraderResult";

export default function GraderRoute() {
  const router = useRouter();
  const grader = useGraderResult();

  return (
    <ToolScreen
      title="Performance Grader"
      footer={
        <ActionButton
          label={grader.grade ? "New grade" : "Grade my answer"}
          icon={ShieldCheck}
          onPress={() => router.push("/practice/testing-portal/grader/new")}
        />
      }
    >
      <Section>
        {grader.grade ? (
          <GraderResultView saved={grader.grade} />
        ) : (
          grader.loaded && (
            <EmptyHint
              icon={ShieldCheck}
              title="No grade yet"
              hint="Tap Grade my answer below, describe the task and objective, then grade your answer."
            />
          )
        )}
      </Section>
    </ToolScreen>
  );
}
