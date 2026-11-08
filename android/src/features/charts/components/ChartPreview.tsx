// src/features/charts/components/ChartPreview.tsx
/** Live Chart.js preview. The generated HTML runs in a WebView that loads Chart.js from the CDN. */
import { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { radius, spacing, useThemeColors } from "@/theme";
import { buildChartDocument, parseChartMessage } from "../lib/chart-document";

const PREVIEW_HEIGHT = 360;

export function ChartPreview({ code }: { code: string }) {
  const colors = useThemeColors();
  const html = useMemo(() => buildChartDocument(code), [code]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [lastCode, setLastCode] = useState(code);
  if (code !== lastCode) {
    setLastCode(code);
    setReady(false);
    setError(null);
  }

  function handleMessage(event: WebViewMessageEvent) {
    const message = parseChartMessage(event.nativeEvent.data);
    if (message) setError(message);
  }

  if (!code.trim()) {
    return (
      <View style={[styles.box, styles.center, { borderColor: colors.border, backgroundColor: colors.muted }]}>
        <Text style={[styles.note, { color: colors.mutedForeground }]}>Nothing to render yet.</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.box, styles.center, { borderColor: colors.border, backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.destructive }]}>Could not render this chart code</Text>
        <Text style={[styles.note, { color: colors.mutedForeground }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.box, { borderColor: colors.border, backgroundColor: "#ffffff" }]}>
      <WebView
        originWhitelist={["https://*", "http://*"]}
        source={{ html }}
        onMessage={handleMessage}
        onLoadEnd={() => setReady(true)}
        setBuiltInZoomControls
        setDisplayZoomControls={false}
        style={styles.webview}
        accessibilityLabel="Chart.js preview"
      />
      {!ready && (
        <View style={[styles.overlay, styles.center]} pointerEvents="none">
          <ActivityIndicator color={colors.mutedForeground} />
          <Text style={[styles.note, { color: colors.mutedForeground }]}>Rendering chart…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: PREVIEW_HEIGHT,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    gap: spacing.sm,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.sm,
  },
  note: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
});
