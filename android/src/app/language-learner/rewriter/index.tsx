/** Rewriter route: rewrites text for a chosen tone, audience, and goal. */
import { StyleSheet, View } from "react-native";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { spacing, useLayout } from "@/theme";
import {
  RewriterFooter,
  RewriterResults,
  RewriterSource,
  useRewriter,
} from "@/features/rewriter/components/RewriterTool";

export default function RewriterRoute() {
  const rewriter = useRewriter();
  const { size } = useLayout();
  const side = size !== "phone";

  return (
    <ToolScreen
      title="Rewriter"
      wide
      footerSide={false}
      headerRight={<ResetButton onPress={rewriter.reset} accessibilityLabel="Reset rewriter" />}
      footer={<RewriterFooter rewriter={rewriter} />}
    >
      <View style={[styles.workspace, side && styles.split]}>
        <View style={[side && styles.pane]}>
          <RewriterSource rewriter={rewriter} />
        </View>
        <View style={[side && styles.pane]}>
          <RewriterResults rewriter={rewriter} />
        </View>
      </View>
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  workspace: {
    gap: spacing.lg,
  },
  split: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xl,
  },
  pane: {
    flex: 1,
    minWidth: 0,
  },
});
