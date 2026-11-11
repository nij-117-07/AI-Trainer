// src/app/learning/explainer/socratic.tsx
import { useEffect, useRef, useState } from "react";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { SocraticFooter, SocraticForm, SocraticResults, useSocratic } from "@/features/explainer/components/SocraticTab";

export default function SocraticRoute() {
  const state = useSocratic();
  const [editing, setEditing] = useState(false);
  const wasPending = useRef(false);
  const { pending, error, result } = state;
  const showForm = editing || !result;

  useEffect(() => {
    if (pending) {
      wasPending.current = true;
    } else if (wasPending.current) {
      wasPending.current = false;
      if (!error && result) setEditing(false);
    }
  }, [pending, error, result]);

  return (
    <ToolScreen
      title="Socratic Mentor"
      headerRight={<ResetButton accessibilityLabel="Reset session" onPress={state.reset} />}
      footer={<SocraticFooter state={state} showForm={showForm} onNewSession={() => setEditing(true)} />}
    >
      {showForm ? <SocraticForm state={state} /> : <SocraticResults state={state} />}
    </ToolScreen>
  );
}
