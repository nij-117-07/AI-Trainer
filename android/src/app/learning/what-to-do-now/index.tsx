// src/app/learning/what-to-do-now/index.tsx
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { WhatToDoNowFooter, WhatToDoNowResults } from "@/features/what-to-do-now/components/WhatToDoNowTab";
import { useWhatToDoNow } from "@/features/what-to-do-now/hooks/useWhatToDoNow";

export default function WhatToDoNowRoute() {
  const state = useWhatToDoNow();

  return (
    <ToolScreen
      title="What To Do Now"
      headerRight={<ResetButton onPress={state.reset} />}
      footer={<WhatToDoNowFooter state={state} />}
    >
      <WhatToDoNowResults state={state} />
    </ToolScreen>
  );
}
