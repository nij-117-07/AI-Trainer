// src/hooks/useCollapsibleForm.ts
/**
 * Open and closed state for a tool's form. The form starts open until a result exists, then
 * closes. Opening scrolls to the end of the page (where the form sits) and closing scrolls back
 * to the top (where the result sits).
 */
import { useEffect, useRef, useState } from "react";
import { useToolScroll } from "@/components/tool/ToolScrollContext";

export function useCollapsibleForm(hasResult: boolean) {
  const scrollRef = useToolScroll();
  const [override, setOverride] = useState<boolean | null>(null);
  const expanded = override ?? !hasResult;
  const wasExpanded = useRef(expanded);

  useEffect(() => {
    if (wasExpanded.current === expanded) return;
    wasExpanded.current = expanded;
    const frame = requestAnimationFrame(() => {
      if (expanded) scrollRef?.current?.scrollToEnd({ animated: true });
      else scrollRef?.current?.scrollTo({ y: 0, animated: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [expanded, scrollRef]);

  return {
    expanded,
    toggle: () => setOverride(!expanded),
    open: () => setOverride(true),
    reset: () => setOverride(null),
  };
}
