// src/app/practice/interview/index.tsx
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { InterviewFooter } from "@/features/interview/components/InterviewFooter";
import { InterviewView } from "@/features/interview/components/InterviewView";
import { useInterviewScreen } from "@/features/interview/hooks/useInterviewScreen";

export default function InterviewRoute() {
  const screen = useInterviewScreen();

  return (
    <ToolScreen
      title="Interview Simulator"
      headerRight={<ResetButton onPress={screen.reset} />}
      footer={<InterviewFooter screen={screen} />}
    >
      <InterviewView screen={screen} />
    </ToolScreen>
  );
}
