// src/app/learning/what-to-do-now/index.tsx
import { WhatToDoNowTab } from "@/features/what-to-do-now/components/WhatToDoNowTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function WhatToDoNowRoute() {
  return (
    <ToolScreen title="What To Do Now">
      <WhatToDoNowTab />
    </ToolScreen>
  );
}
