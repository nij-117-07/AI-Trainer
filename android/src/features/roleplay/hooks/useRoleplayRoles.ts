/**
 * Saved roles on the device, with the create/edit form for the roles screen. Saving a name that
 * already exists updates that role's prompt, as the webui does. A deleted role is hidden until the
 * undo window closes, and is only removed from the device then.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { usePersistedState } from "@/hooks/usePersistedState";
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
  const [form, setForm] = usePersistedState<RoleFormValues>("language-learner.roleplay.role-form.v1", EMPTY_ROLE_FORM);
  const [editing, setEditing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [removed, setRemoved] = useState<string | null>(null);
  const removedRef = useRef<string | null>(null);
  const rolesRef = useRef(roles);

  useEffect(() => {
    rolesRef.current = roles;
  }, [roles]);

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

  const commitRemoval = useCallback(() => {
    const name = removedRef.current;
    if (name === null) return;
    removedRef.current = null;
    setRemoved(null);
    const previous = rolesRef.current;
    const next = removeRole(previous, name);
    rolesRef.current = next;
    saveRoles(next)
      .then(() => {
        setRoles(next);
        setSuccess(`Deleted persona "${name}".`);
      })
      .catch((err: unknown) => {
        rolesRef.current = previous;
        setActionError(messageOf(err, "Failed to delete role."));
      });
  }, []);

  useEffect(() => () => commitRemoval(), [commitRemoval]);

  const remove = useCallback(
    (name: string) => {
      setActionError(null);
      setSuccess(null);
      commitRemoval();
      removedRef.current = name;
      setRemoved(name);
      if (roleSlug(form.name) === roleSlug(name)) startNew();
    },
    [commitRemoval, form.name, startNew],
  );

  const undoRemoval = useCallback(() => {
    removedRef.current = null;
    setRemoved(null);
  }, []);

  return {
    roles: removed === null ? roles : roles.filter((role) => role.name !== removed),
    removed,
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
    undoRemoval,
    commitRemoval,
    actionError,
    success,
  };
}
