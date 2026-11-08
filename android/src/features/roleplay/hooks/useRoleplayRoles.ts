// src/features/roleplay/hooks/useRoleplayRoles.ts
/**
 * Saved roles on the device, with the create/edit form for the roles screen. Saving a name that
 * already exists updates that role's prompt, as the webui does.
 */
import { useCallback, useState } from "react";
import { EMPTY_ROLE_FORM } from "../options";
import { loadRoles, saveRoles } from "../lib/persistence";
import { findRole, removeRole, roleSlug, upsertRole, validateRole } from "../lib/roles";
import type { RoleFormValues, RoleRecord } from "../types";

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useRoleplayRoles() {
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<RoleFormValues>(EMPTY_ROLE_FORM);
  const [editing, setEditing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setRoles(await loadRoles());
      setLoadError(null);
    } catch (err) {
      setLoadError(messageOf(err, "Failed to load roles."));
    } finally {
      setLoaded(true);
    }
  }, []);

  const save = useCallback(async () => {
    setActionError(null);
    setSuccess(null);
    let role: RoleRecord;
    try {
      role = validateRole(form);
    } catch (err) {
      setActionError(messageOf(err, "Check the persona fields."));
      return;
    }
    const existed = findRole(roles, role.name) !== undefined;
    const next = upsertRole(roles, role);
    try {
      await saveRoles(next);
      setRoles(next);
      setSuccess(existed ? `Updated persona "${role.name}".` : `Created persona "${role.name}".`);
      setEditing(true);
      setForm({ name: role.name, prompt: role.prompt });
    } catch (err) {
      setActionError(messageOf(err, "Failed to save role."));
    }
  }, [form, roles]);

  const edit = useCallback((role: RoleRecord) => {
    setForm({ name: role.name, prompt: role.prompt });
    setEditing(true);
    setActionError(null);
    setSuccess(null);
  }, []);

  const startNew = useCallback(() => {
    setForm(EMPTY_ROLE_FORM);
    setEditing(false);
    setActionError(null);
    setSuccess(null);
  }, []);

  const remove = useCallback(
    async (name: string) => {
      setActionError(null);
      setSuccess(null);
      const next = removeRole(roles, name);
      try {
        await saveRoles(next);
        setRoles(next);
        setSuccess(`Deleted persona "${name}".`);
        if (roleSlug(form.name) === roleSlug(name)) startNew();
      } catch (err) {
        setActionError(messageOf(err, "Failed to delete role."));
      }
    },
    [form.name, roles, startNew],
  );

  return {
    roles,
    loaded,
    loadError,
    reload,
    form,
    setForm,
    editing,
    save,
    edit,
    startNew,
    remove,
    actionError,
    success,
  };
}
