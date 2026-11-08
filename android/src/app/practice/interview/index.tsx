// src/app/practice/interview/index.tsx
import { InterviewView } from "@/features/interview/components/InterviewView";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function InterviewRoute() {
  return (
    <ToolScreen title="Interview Simulator">
      <InterviewView />
    </ToolScreen>
  );
}
