// src/features/diagram/lib/preview-html.ts
/**
 * HTML pages for the WebView previews. The Mermaid page renders code sent in from React Native.
 * The Draw.io page wraps the diagrams.net embed and relays its save events back to React Native.
 */

export const MERMAID_CDN_URL = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
export const DRAWIO_EMBED_URL =
  "https://embed.diagrams.net/?embed=1&ui=atlas&spin=1&proto=json&saveAndExit=1&modified=unsavedChanges&title=Diagram+Editor";

const PAGE_STYLE = `html, body { margin: 0; height: 100%; background: #ffffff; }`;

export const MERMAID_PREVIEW_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
<style>
${PAGE_STYLE}
#diagram { padding: 12px; }
#diagram svg { max-width: 100%; height: auto; }
</style>
</head>
<body>
<div id="diagram"></div>
<script src="${MERMAID_CDN_URL}"></script>
<script>
var counter = 0;
function post(message) {
  window.ReactNativeWebView.postMessage(JSON.stringify(message));
}
function clearDiagram() {
  document.getElementById("diagram").innerHTML = "";
}
function renderDiagram(code) {
  if (typeof mermaid === "undefined") {
    post({ type: "error", message: "Mermaid could not be loaded. Check the internet connection." });
    return;
  }
  mermaid.initialize({ startOnLoad: false, securityLevel: "loose", theme: "default" });
  counter += 1;
  mermaid
    .render("mermaid-diagram-" + counter, code)
    .then(function (result) {
      document.getElementById("diagram").innerHTML = result.svg;
      post({ type: "ready" });
    })
    .catch(function (err) {
      post({ type: "error", message: String((err && err.message) || err) });
    });
}
</script>
</body>
</html>`;

function scriptSafeJson(value: string): string {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

export function buildDrawioHtml(xml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
${PAGE_STYLE}
iframe { display: block; width: 100%; height: 100%; border: 0; }
</style>
</head>
<body>
<iframe id="editor" src="${DRAWIO_EMBED_URL}" allowfullscreen></iframe>
<script>
var diagramXml = ${scriptSafeJson(xml)};
var frame = document.getElementById("editor");
function post(message) {
  window.ReactNativeWebView.postMessage(JSON.stringify(message));
}
window.addEventListener("message", function (event) {
  if (event.source !== frame.contentWindow || typeof event.data !== "string") return;
  var msg;
  try { msg = JSON.parse(event.data); } catch (e) { return; }
  if (!msg || typeof msg.event !== "string") return;
  if (msg.event === "init") {
    frame.contentWindow.postMessage(JSON.stringify({ action: "load", xml: diagramXml, autosave: 1 }), "*");
  } else if (msg.event === "save" || msg.event === "autosave") {
    if (typeof msg.xml === "string") post({ type: "save", xml: msg.xml });
  } else if (msg.event === "exit") {
    post({ type: "exit" });
  }
});
</script>
</body>
</html>`;
}

export interface BridgeMessage {
  type: string;
  message?: string;
  xml?: string;
}

export function parseBridgeMessage(raw: string): BridgeMessage | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    const record = parsed as Record<string, unknown>;
    if (typeof record.type !== "string") return null;
    return {
      type: record.type,
      message: typeof record.message === "string" ? record.message : undefined,
      xml: typeof record.xml === "string" ? record.xml : undefined,
    };
  } catch {
    return null;
  }
}
