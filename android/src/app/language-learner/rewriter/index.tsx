// src/app/language-learner/rewriter/index.tsx
/** Rewriter route: rewrites text for a chosen tone, audience, and goal. */
import { RewriterTool } from "@/features/rewriter/components/RewriterTool";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function RewriterRoute() {
  return (
    <ToolScreen title="Rewriter">
      <RewriterTool />
    </ToolScreen>
  );
}
