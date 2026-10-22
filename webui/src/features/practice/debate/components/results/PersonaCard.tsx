// src/features/practice/debate/components/results/PersonaCard.tsx
/**
 * A single debater persona (Pro or Con) with an editor dialog. The profile can
 * be edited at any point during the game — before the first turn or in between
 * turns — and the persona can also be regenerated with AI from the persona form.
 */
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Pencil, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { rhetoricalStances, type DebateSide, type PersonaProfile, type RhetoricalStance } from "../../types";

interface PersonaCardProps {
  side: DebateSide;
  persona: PersonaProfile;
  topic: string;
  regenPending: boolean;
  onSave: (persona: PersonaProfile) => void;
  onRegenerate: () => void;
}

export function PersonaCard({
  side,
  persona,
  topic,
  regenPending,
  onSave,
  onRegenerate,
}: PersonaCardProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(persona.persona_name);
  const [stance, setStance] = useState<RhetoricalStance>(persona.overall_stance);
  const [priorities, setPriorities] = useState(persona.strategic_priorities.join("\n"));
  const [coreValues, setCoreValues] = useState(persona.core_values.join("\n"));
  const [quirks, setQuirks] = useState(persona.linguistic_quirks.join("\n"));
  const [systemPrompt, setSystemPrompt] = useState(persona.system_prompt);

  const isPro = side === "pro";
  const accent = isPro
    ? "border-emerald-500/30"
    : "border-rose-500/30";

  const openDialog = () => {
    setName(persona.persona_name);
    setStance(persona.overall_stance);
    setPriorities(persona.strategic_priorities.join("\n"));
    setCoreValues(persona.core_values.join("\n"));
    setQuirks(persona.linguistic_quirks.join("\n"));
    setSystemPrompt(persona.system_prompt);
    setOpen(true);
  };

  const toList = (raw: string) =>
    raw
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

  const save = () => {
    onSave({
      persona_name: name.trim() || persona.persona_name,
      overall_stance: stance,
      strategic_priorities: toList(priorities),
      core_values: toList(coreValues),
      linguistic_quirks: toList(quirks),
      system_prompt: systemPrompt.trim() || persona.system_prompt,
    });
    setOpen(false);
  };

  return (
    <>
      <Card className={cn("h-full", accent)}>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  isPro
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                )}
              >
                {isPro ? "Pro" : "Con"}
              </Badge>
              <p className="text-sm font-semibold">{persona.persona_name}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={regenPending}
                onClick={openDialog}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={regenPending}
                onClick={onRegenerate}
              >
                {regenPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                Regenerate
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {isPro ? "For" : "Against"}: <span className="font-medium text-foreground">{topic}</span>
          </p>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">Stance</p>
            <p className="text-sm capitalize">{persona.overall_stance}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">Strategic priorities</p>
            <ul className="list-inside list-disc text-sm text-muted-foreground">
              {persona.strategic_priorities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">Core values</p>
            <ul className="list-inside list-disc text-sm text-muted-foreground">
              {persona.core_values.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">Linguistic quirks</p>
            <ul className="list-inside list-disc text-sm text-muted-foreground">
              {persona.linguistic_quirks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100%-2rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Edit {isPro ? "Pro" : "Con"} persona
            </DialogTitle>
            <DialogDescription>
              Changes apply immediately and affect every AI-generated turn for this side.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor={`persona_name_${side}`}>Name</Label>
              <Input
                id={`persona_name_${side}`}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Overall stance</Label>
              <Select value={stance} onValueChange={(value) => setStance(value as RhetoricalStance)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rhetoricalStances.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`persona_priorities_${side}`}>Strategic priorities</Label>
              <Textarea
                id={`persona_priorities_${side}`}
                value={priorities}
                onChange={(event) => setPriorities(event.target.value)}
                placeholder="One per line"
                className="min-h-16 resize-none bg-transparent"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`persona_values_${side}`}>Core values</Label>
              <Textarea
                id={`persona_values_${side}`}
                value={coreValues}
                onChange={(event) => setCoreValues(event.target.value)}
                placeholder="One per line"
                className="min-h-16 resize-none bg-transparent"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`persona_quirks_${side}`}>Linguistic quirks</Label>
              <Textarea
                id={`persona_quirks_${side}`}
                value={quirks}
                onChange={(event) => setQuirks(event.target.value)}
                placeholder="One per line"
                className="min-h-16 resize-none bg-transparent"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`persona_prompt_${side}`}>System prompt</Label>
              <Textarea
                id={`persona_prompt_${side}`}
                value={systemPrompt}
                onChange={(event) => setSystemPrompt(event.target.value)}
                className="min-h-32 resize-none bg-transparent"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="gap-1.5"
              disabled={regenPending}
              onClick={onRegenerate}
            >
              {regenPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Regenerate with AI
            </Button>
            <Button type="button" onClick={save}>
              Save persona
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
