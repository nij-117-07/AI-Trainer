// src/features/language-tester/components/ToolSlotFill.tsx
/** Places a screen's footer and header-right controls into the ToolScreen that hosts it. Renders nothing. */
import { useEffect, type ReactNode } from "react";
import { useToolSlots } from "@/components/tool/tool-slots";

interface ToolSlotFillProps {
  footer?: ReactNode;
  headerRight?: ReactNode;
}

export function ToolSlotFill({ footer, headerRight }: ToolSlotFillProps) {
  const slots = useToolSlots();

  useEffect(() => {
    slots?.setFooter(footer ?? null);
    return () => slots?.setFooter(null);
  });

  useEffect(() => {
    slots?.setHeaderRight(headerRight ?? null);
    return () => slots?.setHeaderRight(null);
  });

  return null;
}
