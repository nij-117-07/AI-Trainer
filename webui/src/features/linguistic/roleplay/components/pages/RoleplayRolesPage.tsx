// src/features/linguistic/roleplay/components/pages/RoleplayRolesPage.tsx
/**
 * Role manager for the Roleplay Module. Lists stored personas and lets you
 * create, edit, load, or delete them. Wired to the roleplay persona CRUD
 * Server Actions (create → POST, update → PATCH, delete → 204).
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, BookOpenCheck, Loader2, Pencil, Plus, Save, Trash2, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RoleSaveSchema, type RoleSaveValues } from "../../types";
import {
  createRoleplayRoleAction,
  deleteRoleplayRoleAction,
  getRoleplayRoleAction,
  listRoleplayRolesAction,
  updateRoleplayRoleAction,
} from "../../actions/roles";

const EMPTY_FORM: RoleSaveValues = { name: "", prompt: "" };

export function RoleplayRolesPage() {
  const [names, setNames] = useState<string[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [form, setForm] = useState<RoleSaveValues>(EMPTY_FORM);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState<"list" | "save" | "get" | "delete" | null>(null);
  const [activeName, setActiveName] = useState<string | null>(null);

  const loadNames = useCallback(async () => {
    setPending("list");
    setListError(null);
    try {
      setNames(await listRoleplayRolesAction());
    } catch (error) {
      setListError(error instanceof Error ? error.message : "Failed to load roles.");
    } finally {
      setPending(null);
    }
  }, []);

  useEffect(() => {
    // Initial role list load; the pending flag is intentional mount feedback.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadNames();
  }, [loadNames]);

  const handleLoad = async (name: string) => {
    setPending("get");
    setActiveName(name);
    setActionError(null);
    setSuccess(null);
    try {
      const role = await getRoleplayRoleAction(name);
      setForm({ name: role.name, prompt: role.prompt });
      setFieldError(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to load role.");
    } finally {
      setPending(null);
      setActiveName(null);
    }
  };

  const handleSave = async () => {
    const parsed = RoleSaveSchema.safeParse(form);
    if (!parsed.success) {
      setFieldError(parsed.error.issues.map((issue) => issue.message).join(", "));
      return;
    }
    setFieldError(null);
    setActionError(null);
    setSuccess(null);
    setPending("save");
    try {
      if ((names ?? []).includes(parsed.data.name)) {
        await updateRoleplayRoleAction(parsed.data.name, {
          prompt: parsed.data.prompt,
        });
        setSuccess(`Updated persona "${parsed.data.name}".`);
      } else {
        const role = await createRoleplayRoleAction(parsed.data);
        setSuccess(`Created persona "${role.name}".`);
      }
      await loadNames();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to save role.");
    } finally {
      setPending(null);
    }
  };

  const handleDelete = async (name: string) => {
    if (!window.confirm(`Delete roleplay persona "${name}"?`)) return;
    setActionError(null);
    setSuccess(null);
    setPending("delete");
    setActiveName(name);
    try {
      await deleteRoleplayRoleAction(name);
      setSuccess(`Deleted persona "${name}".`);
      setNames((current) => (current ? current.filter((n) => n !== name) : current));
      if (form.name === name) setForm(EMPTY_FORM);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to delete role.");
    } finally {
      setPending(null);
      setActiveName(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Roleplay Roles</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Manage the persona system prompts stored by the Roleplay Module
          service. Create new personas or edit and delete existing ones.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {form.name ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {form.name ? `Editing "${form.name}"` : "New Persona"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="role-name" className="text-sm font-medium">
                  Name
                </Label>
                <Input
                  id="role-name"
                  className="bg-transparent"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="e.g. grumpy_waiter"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role-prompt" className="text-sm font-medium">
                  Prompt
                </Label>
                <Textarea
                  id="role-prompt"
                  className="min-h-40 resize-none bg-transparent"
                  value={form.prompt}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, prompt: event.target.value }))
                  }
                  placeholder="The persona system prompt, e.g. 'You are a grumpy Parisian waiter.'"
                />
              </div>
              {fieldError && (
                <p className="text-xs text-destructive">{fieldError}</p>
              )}
              {actionError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}
              {success && (
                <p className="text-xs text-emerald-600">{success}</p>
              )}
              <Button
                onClick={() => void handleSave()}
                disabled={pending !== null}
                className="w-full gap-2"
              >
                {pending === "save" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {form.name ? "Update Persona" : "Create Persona"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpenCheck className="h-4 w-4" />
                Saved Personas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pending === "list" && names === null ? (
                <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading roles…
                </div>
              ) : listError ? (
                <div className="space-y-3 py-4">
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{listError}</span>
                  </div>
                  <Button variant="outline" onClick={() => void loadNames()} disabled={pending !== null}>
                    Retry
                  </Button>
                </div>
              ) : names && names.length > 0 ? (
                <ul className="divide-y">
                  {names.map((name) => (
                    <li
                      key={name}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <UserCog className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 truncate font-mono text-sm">{name}</span>
                      </span>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleLoad(name)}
                          disabled={pending !== null}
                        >
                          {pending === "get" && activeName === name ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Pencil className="h-3.5 w-3.5" />
                          )}
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => void handleDelete(name)}
                          disabled={pending !== null}
                        >
                          {pending === "delete" && activeName === name ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No personas saved yet. Create one on the left.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
