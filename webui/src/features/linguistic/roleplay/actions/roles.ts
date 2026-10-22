// src/features/linguistic/roleplay/actions/roles.ts
/**
 * Server Actions for the Roleplay Module persona endpoints
 * (GET/POST /linguistic/roleplay_module/roles,
 * GET/PATCH/DELETE /linguistic/roleplay_module/roles/{name}).
 */
"use server";

import { z } from "zod";
import {
  RoleRecordSchema,
  RoleSaveSchema,
  RoleUpdateSchema,
  type RoleRecord,
  type RoleSaveValues,
  type RoleUpdateValues,
} from "../types";
import {
  deleteJson,
  getJson,
  patchJson,
  postJson,
  roleplayApiUrl,
  safeParse,
} from "../lib/api";

function roleNameUrl(name: string): string {
  return roleplayApiUrl(`roles/${encodeURIComponent(name)}`);
}

export async function listRoleplayRolesAction(): Promise<string[]> {
  const raw = await getJson<unknown>(roleplayApiUrl("roles"));
  return safeParse(z.array(z.string()), raw, "Invalid roleplay roles list");
}

export async function getRoleplayRoleAction(name: string): Promise<RoleRecord> {
  const raw = await getJson<unknown>(roleNameUrl(name));
  return safeParse(RoleRecordSchema, raw, "Invalid roleplay role response");
}

export async function createRoleplayRoleAction(
  input: RoleSaveValues
): Promise<RoleRecord> {
  safeParse(RoleSaveSchema, input, "Invalid roleplay role payload");
  const raw = await postJson<unknown>(roleplayApiUrl("roles"), input);
  return safeParse(RoleRecordSchema, raw, "Invalid roleplay role response");
}

export async function updateRoleplayRoleAction(
  name: string,
  input: RoleUpdateValues
): Promise<RoleRecord> {
  safeParse(RoleUpdateSchema, input, "Invalid roleplay role update");
  const raw = await patchJson<unknown>(roleNameUrl(name), input);
  return safeParse(RoleRecordSchema, raw, "Invalid roleplay role update response");
}

export async function deleteRoleplayRoleAction(name: string): Promise<void> {
  await deleteJson<void>(roleNameUrl(name));
}
