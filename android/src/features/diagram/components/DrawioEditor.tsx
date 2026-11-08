// src/features/diagram/components/DrawioEditor.tsx
/**
 * Draw.io editor. Runs the diagrams.net embed in a WebView and sends saved XML back to the screen.
 * The page is built once per mount, so the editor keeps its state while the user edits.
 */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { Info } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { buildDrawioHtml, parseBridgeMessage } from "../lib/preview-html";

interface DrawioEditorProps {
  xml: string;
  onSave: (xml: string) => void;
}

export function DrawioEditor({ xml, onSave }: DrawioEditorProps) {
  const colors = useThemeColors();
  const [source] = useState(() => ({ html: buildDrawioHtml(xml) }));

  function handleMessage(event: WebViewMessageEvent) {
    const message = parseBridgeMessage(event.nativeEvent.data);
    if (message?.type === "save" && message.xml) onSave(message.xml);
  }

  return (
    <View style={styles.block}>
      <View style={[styles.notice, { backgroundColor: colors.muted }]}>
        <Info size={14} color={colors.mutedForeground} />
        <Text style={[styles.noticeText, { color: colors.mutedForeground }]}>
          Edit the diagram like you would on draw.io. Press{" "}
          <Text style={[styles.strong, { color: colors.foreground }]}>Save and Exit</Text> to apply changes. Requires
          internet, powered by diagrams.net.
        </Text>
      </View>
      <View style={[styles.frame, { borderColor: colors.border }]}>
        <WebView source={source} onMessage={handleMessage} style={styles.webview} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.sm,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  strong: {
    fontWeight: "600",
  },
  frame: {
    height: 520,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  webview: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
