// src/app/practice/testing-portal/grader/index.tsx
import { useRouter } from "expo-router";
import { Plus, ShieldCheck } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { GraderResultView } from "@/features/testing-portal/components/GraderResultView";
import { PortalLoading } from "@/features/testing-portal/components/PortalLoading";
import { useGraderResult } from "@/features/testing-portal/hooks/useGraderResult";

export default function GraderRoute() {
  const router = useRouter();
  const grader = useGraderResult();

  return (
    <ToolScreen
      title="Performance Grader"
      footer={
        <ActionButton
          label="New grading"
          icon={Plus}
          onPress={() => router.push("/practice/testing-portal/grader/new")}
        />
      }
    >
      <Section>
        {grader.grade ? (
          <GraderResultView saved={grader.grade} />
        ) : grader.loaded ? (
          <EmptyHint
            icon={ShieldCheck}
            title="No grading yet"
            hint="Add the objective and your answer to get a score."
          />
        ) : (
          <PortalLoading />
        )}
      </Section>
    </ToolScreen>
  );
}
