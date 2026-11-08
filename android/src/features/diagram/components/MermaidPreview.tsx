// src/features/diagram/components/MermaidPreview.tsx
/** Mermaid preview. The code renders inside a WebView that loads mermaid from jsDelivr. */
import { useCallback, useEffect, useRef, useState, type ComponentRef } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { radius, spacing, useThemeColors } from "@/theme";
import { MERMAID_PREVIEW_HTML, parseBridgeMessage } from "../lib/preview-html";

type PreviewStatus = { state: "idle" } | { state: "rendering" } | { state: "ready" } | { state: "error"; message: string };

const MERMAID_SOURCE = { html: MERMAID_PREVIEW_HTML };

export function MermaidPreview({ code }: { code: string }) {
  const colors = useThemeColors();
  const webRef = useRef<ComponentRef<typeof WebView>>(null);
  const loadedRef = useRef(false);
  const [status, setStatus] = useState<PreviewStatus>({ state: "idle" });

  const render = useCallback((source: string) => {
    if (!source.trim()) {
      setStatus({ state: "idle" });
      webRef.current?.injectJavaScript("window.clearDiagram(); true;");
      return;
    }
    setStatus({ state: "rendering" });
    webRef.current?.injectJavaScript(`window.renderDiagram(${JSON.stringify(source)}); true;`);
  }, []);

  useEffect(() => {
    if (loadedRef.current) render(code);
  }, [code, render]);

  function handleLoadEnd() {
    loadedRef.current = true;
    render(code);
  }

  function handleMessage(event: WebViewMessageEvent) {
    const message = parseBridgeMessage(event.nativeEvent.data);
    if (message?.type === "ready") setStatus({ state: "ready" });
    if (message?.type === "error") setStatus({ state: "error", message: message.message ?? "Unknown error" });
  }

  return (
    <View style={styles.block}>
      <View style={[styles.frame, { borderColor: colors.border }]}>
        <WebView
          ref={webRef}
          source={MERMAID_SOURCE}
          onLoadEnd={handleLoadEnd}
          onMessage={handleMessage}
          setBuiltInZoomControls
          setDisplayZoomControls={false}
          style={styles.webview}
        />
      </View>

      {status.state === "idle" && <Text style={[styles.note, { color: colors.mutedForeground }]}>Nothing to render yet.</Text>}
      {status.state === "rendering" && (
        <View style={styles.row}>
          <ActivityIndicator color={colors.mutedForeground} />
          <Text style={[styles.note, { color: colors.mutedForeground }]}>Rendering diagram…</Text>
        </View>
      )}
      {status.state === "error" && (
        <View style={[styles.error, { borderColor: colors.destructive }]}>
          <Text style={[styles.errorTitle, { color: colors.destructive }]}>Could not render this Mermaid code</Text>
          <Text style={[styles.note, { color: colors.mutedForeground }]}>{status.message}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.sm,
  },
  frame: {
    height: 420,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  webview: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  note: {
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
});
