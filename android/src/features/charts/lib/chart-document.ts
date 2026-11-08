// src/features/charts/lib/chart-document.ts
/**
 * Builds the standalone HTML page that the preview WebView loads. Chart.js comes from the jsdelivr
 * CDN unless the generated code already loads a chart library, and runtime errors are posted back
 * to React Native as JSON messages.
 */
import { isRecord } from "./text";

export const CHART_CDN = "https://cdn.jsdelivr.net/npm/chart.js@4";

const CDN_HOSTS = ["cdn.jsdelivr.net", "cdnjs.cloudflare.com", "unpkg.com"];

export function buildChartDocument(code: string): string {
  const hasCdn = CDN_HOSTS.some((host) => code.includes(host));
  const chartTag = hasCdn ? "" : `<script src="${CHART_CDN}"></script>`;
  return [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    chartTag,
    "<script>",
    "window.onerror = function (message) {",
    "  if (window.ReactNativeWebView) {",
    '    window.ReactNativeWebView.postMessage(JSON.stringify({ type: "chart-error", message: String(message) }));',
    "  }",
    "};",
    "</script>",
    "<style>",
    "html, body { margin: 0; height: 100%; }",
    "body { box-sizing: border-box; display: flex; align-items: center; justify-content: center; padding: 16px; background: #fff; overflow: hidden; }",
    "body > div { width: 100% !important; height: 100% !important; }",
    "</style>",
    "</head>",
    "<body>",
    code,
    "</body>",
    "</html>",
  ].join("\n");
}

/** Returns the error text when a WebView message reports a chart failure, otherwise null. */
export function parseChartMessage(data: string): string | null {
  try {
    const parsed: unknown = JSON.parse(data);
    if (!isRecord(parsed) || parsed.type !== "chart-error") return null;
    return typeof parsed.message === "string" && parsed.message ? parsed.message : "Failed to render chart";
  } catch {
    return null;
  }
}
