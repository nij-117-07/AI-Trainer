// src/features/practice/bias-inoculator/components/results/BiasInoculatorResult.tsx
/**
 * Displays the generated bias scenario: the target bias, the stealthy setup,
 * the intuitive trap, the rational analysis, and a real-world application tip.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { ShieldAlert, Zap, Scale, Compass } from "lucide-react";
import type { BiasResponse } from "../../types";

function Section({ icon: Icon, title, content }: { icon: typeof Zap; title: string; content: string }) {
  return (
    <div className="space-y-1.5">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h3>
      <MarkdownContent content={content} className="text-sm" />
    </div>
  );
}

export function BiasInoculatorResult({ result }: { result: BiasResponse }) {
  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <div>
          <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm font-medium capitalize text-amber-600 dark:text-amber-400">
            <ShieldAlert className="mr-1.5 h-4 w-4" />
            Training against: {result.target_bias.replace("_", " ")}
          </span>
        </div>
        <Section icon={ShieldAlert} title="Scenario Setup" content={result.scenario_setup} />
        <Section icon={Zap} title="The Intuitive Trap" content={result.intuitive_trap} />
        <Section icon={Scale} title="Rational Analysis" content={result.rational_analysis} />
        <Section icon={Compass} title="Real-World Application" content={result.real_world_application} />
      </CardContent>
    </Card>
  );
}
