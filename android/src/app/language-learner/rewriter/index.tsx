// src/app/language-learner/rewriter/index.tsx
/** Rewriter route: rewrites text for a chosen tone, audience, and goal. */
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import {
  RewriterFooter,
  RewriterResults,
  useRewriter,
} from "@/features/rewriter/components/RewriterTool";

export default function RewriterRoute() {
  const rewriter = useRewriter();

  return (
    <ToolScreen
      title="Rewriter"
      headerRight={<ResetButton onPress={rewriter.reset} />}
      footer={<RewriterFooter rewriter={rewriter} />}
    >
      <RewriterResults rewriter={rewriter} />
    </ToolScreen>
  );
}
