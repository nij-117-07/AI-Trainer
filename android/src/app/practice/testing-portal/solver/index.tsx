// src/app/practice/testing-portal/solver/index.tsx
import { useRouter } from "expo-router";
import { Target } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { PortalLoading } from "@/features/testing-portal/components/PortalLoading";
import { SolverResultView } from "@/features/testing-portal/components/SolverResultView";
import { useSolverResult } from "@/features/testing-portal/hooks/useSolverResult";

export default function SolverRoute() {
  const router = useRouter();
  const solver = useSolverResult();

  return (
    <ToolScreen
      title="Solve an MCQ"
      footer={
        <ActionButton
          label={solver.solution ? "New question" : "Solve with AI"}
          icon={Target}
          onPress={() => router.push("/practice/testing-portal/solver/new")}
        />
      }
    >
      <Section>
        {solver.solution ? (
          <SolverResultView saved={solver.solution} />
        ) : solver.loaded ? (
          <EmptyHint
            icon={Target}
            title="No question yet"
            hint="Tap Solve with AI, paste the question and its four options, then solve it."
          />
        ) : (
          <PortalLoading />
        )}
      </Section>
    </ToolScreen>
  );
}
