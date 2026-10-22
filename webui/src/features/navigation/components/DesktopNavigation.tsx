// src/features/navigation/components/DesktopNavigation.tsx
/**
 * Desktop navigation with native Radix sub-menus.
 * Uses DropdownMenuSub for nested items (handles hover/delay natively).
 * Top-level items use manual hover state for open-on-hover behavior.
 * Highlights active route via useActiveRoute hook.
 */
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NavigationNode } from "../types";
import { useActiveRoute } from "../hooks/useActiveRoute";

function SubNavItem({ node }: { node: NavigationNode }) {
  const { isActive } = useActiveRoute();

  if (node.children.length === 0) {
    return (
      <DropdownMenuItem asChild>
        <Link
          href={node.href}
          className={cn(
            "cursor-pointer py-2",
            isActive(node.href) && "bg-accent font-semibold"
          )}
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">{node.title}</span>
            {node.description && (
              <span className="text-xs text-muted-foreground line-clamp-1">
                {node.description}
              </span>
            )}
          </div>
        </Link>
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="py-2">
        <div className="flex flex-col items-start gap-0.5">
          <span className="font-medium">{node.title}</span>
          {node.description && (
            <span className="text-xs text-muted-foreground">{node.description}</span>
          )}
        </div>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-60">
        {node.children.map((child) => (
          <SubNavItem key={child.id} node={child} />
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

interface DesktopNavigationProps {
  rootNode: NavigationNode;
}

export function DesktopNavigation({ rootNode }: DesktopNavigationProps) {
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const { isActive } = useActiveRoute();

  const openMenu = (id: string) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setOpenMenus((prev) => new Set(prev).add(id));
  };

  const closeMenu = (id: string, delay = 400) => {
    const timer = setTimeout(() => {
      setOpenMenus((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      timers.current.delete(id);
    }, delay);
    timers.current.set(id, timer);
  };

  return (
    <nav className="hidden md:flex items-center gap-1">
      {rootNode.children.map((node) => {
        const hasChildren = node.children.length > 0;
        const isOpen = openMenus.has(node.id);

        return (
          <DropdownMenu key={node.id} open={isOpen} modal={false}>
            <DropdownMenuTrigger asChild>
              <div onMouseEnter={() => openMenu(node.id)} onMouseLeave={() => closeMenu(node.id)}>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-1 h-10 px-4 relative",
                    isActive(node.href) && !hasChildren && "bg-accent font-semibold"
                  )}
                >
                  {node.title}
                  {hasChildren && <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </DropdownMenuTrigger>
            {hasChildren && (
              <DropdownMenuContent
                align="start"
                className="w-60"
                sideOffset={-2}
                onMouseEnter={() => openMenu(node.id)}
                onMouseLeave={() => closeMenu(node.id)}
              >
                {node.children.map((child) => (
                  <SubNavItem key={child.id} node={child} />
                ))}
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        );
      })}
    </nav>
  );
}
