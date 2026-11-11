// src/app/learning/what-to-do-now/index.tsx
import { useEffect, useState } from "react";
import { Plus } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { WhatToDoNowFooter, WhatToDoNowForm, WhatToDoNowResults } from "@/features/what-to-do-now/components/WhatToDoNowTab";
import { useWhatToDoNow } from "@/features/what-to-do-now/hooks/useWhatToDoNow";

export default function WhatToDoNowRoute() {
  const state = useWhatToDoNow();
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    if (!state.result) return;
    setFormOpen(false);
  }, [state.result]);

  return (
    <ToolScreen
      title="What To Do Now"
      headerRight={formOpen ? <ResetButton onPress={state.reset} accessibilityLabel="Reset form and result" /> : undefined}
      footer={
        formOpen ? (
          <WhatToDoNowFooter state={state} />
        ) : (
          <ActionButton label="New plan" icon={Plus} onPress={() => setFormOpen(true)} />
        )
      }
    >
      {formOpen ? (
        <WhatToDoNowForm state={state} />
      ) : (
        <WhatToDoNowResults state={state} onToggle={state.toggleDone} />
      )}
    </ToolScreen>
  );
}
