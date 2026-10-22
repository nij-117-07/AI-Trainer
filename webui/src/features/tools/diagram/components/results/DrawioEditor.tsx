// src/features/tools/diagram/components/results/DrawioEditor.tsx
/**
 * Inline Draw.io (diagrams.net) editor embed.
 *
 * Runs the real diagrams.net editor inside an iframe and communicates via the
 * official embed JSON protocol (https://embed.diagrams.net/?embed=1&proto=json):
 *   - editor -> host: {event: 'init'}        -> host replies {action:'load', xml}
 *   - editor -> host: {event: 'save', xml}   -> edited diagram returned
 *   - editor -> host: {event: 'autosave', xml}
 *   - editor -> host: {event: 'exit'}
 *
 * Diagram data stays client-side; it is never sent to the diagrams.net server.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { Info, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const EMBED_URL =
  "https://embed.diagrams.net/?embed=1&ui=atlas&spin=1&proto=json&saveAndExit=1&modified=unsavedChanges&title=Diagram+Editor";

interface DrawioEditorProps {
  /** Initial diagram XML (mxGraphModel / draw.io format) to load. */
  xml: string;
  /** Called whenever the user saves (or autosaves) an edited diagram. */
  onSave: (xml: string) => void;
  /** Called when the user exits the editor. */
  onClose: () => void;
}

export function DrawioEditor({ xml, onSave, onClose }: DrawioEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const handlersRef = useRef({ onSave, onClose });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    handlersRef.current = { onSave, onClose };
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const iframe = iframeRef.current;
      if (!iframe || event.source !== iframe.contentWindow) return;
      if (typeof event.data !== "string") return;

      let msg: { event?: string; xml?: string; exit?: boolean };
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }
      if (!msg || typeof msg.event !== "string") return;

      switch (msg.event) {
        case "init":
          iframe.contentWindow?.postMessage(
            JSON.stringify({ action: "load", xml, autosave: 1 }),
            "*"
          );
          break;
        case "save":
          if (typeof msg.xml === "string") handlersRef.current.onSave(msg.xml);
          if (msg.exit) handlersRef.current.onClose();
          break;
        case "autosave":
          if (typeof msg.xml === "string") handlersRef.current.onSave(msg.xml);
          break;
        case "exit":
          handlersRef.current.onClose();
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [xml]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p className="flex-1">
          Edit the diagram like you would on draw.io. Press{" "}
          <span className="font-medium text-foreground">Save and Exit</span> to apply changes.
          Requires internet — powered by diagrams.net.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={() => setExpanded(true)}
        >
          <Maximize2 className="h-3.5 w-3.5" />
          Expand
        </Button>
      </div>
      {!expanded && (
        <iframe
          ref={iframeRef}
          src={EMBED_URL}
          title="Draw.io editor"
          className="h-[560px] w-full rounded-lg border border-border bg-white"
          allowFullScreen
        />
      )}
      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="flex h-[90dvh] w-[calc(100%-2rem)] flex-col gap-3 sm:max-w-none">
          <DialogTitle className="sr-only">Draw.io editor</DialogTitle>
          <iframe
            ref={iframeRef}
            src={EMBED_URL}
            title="Draw.io editor (expanded)"
            className="h-full w-full flex-1 rounded-lg border border-border bg-white"
            allowFullScreen
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
