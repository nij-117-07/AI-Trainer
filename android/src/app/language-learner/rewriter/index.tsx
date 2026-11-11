/** Rewriter route: rewrites text for a chosen tone, audience, and goal. */
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { useLayout } from "@/theme";
import {
  RewriterFooter,
  RewriterResults,
  useRewriter,
} from "@/features/rewriter/components/RewriterTool";

export default function RewriterRoute() {
  const rewriter = useRewriter();
  const { size } = useLayout();
  const sideForm = size !== "phone";

  return (
    <ToolScreen
      title="Rewriter"
      headerRight={<ResetButton onPress={rewriter.reset} />}
      footer={sideForm ? <RewriterFooter rewriter={rewriter} /> : undefined}
    >
      {sideForm ? null : <RewriterFooter rewriter={rewriter} />}
      <RewriterResults rewriter={rewriter} />
    </ToolScreen>
  );
}
