// src/features/tools/lib/api.ts
/**
 * Server-only helpers for the Tools services (Vision Converter, Social Posts,
 * Prompt Generator, Ingredients, Flexible Writer, Diagram, Creative Assets,
 * Charts). Re-exports the shared core-backend helpers and adds a URL builder
 * scoped to the `/tools/*` service paths plus a multipart POST for uploads.
 */
import { apiHeaders, learningApiUrl, readApiError } from "@/features/learning/lib/api";

export {
  deleteJson,
  getJson,
  patchJson,
  postJson,
  putJson,
  safeParse,
} from "@/features/learning/lib/api";

/** Builds the absolute URL for a backend endpoint under `/tools/*`. */
export function toolsApiUrl(servicePath: string, endpoint: string): string {
  return learningApiUrl(servicePath, endpoint);
}

/**
 * Posts a `multipart/form-data` body (file uploads) and returns the parsed
 * JSON body. The Content-Type header is deliberately omitted so the browser /
 * fetch sets the correct multipart boundary.
 */
export async function postFormData<T>(url: string, formData: FormData): Promise<T> {
  let response: Response;
  try {
    const headers = apiHeaders();
    delete headers["Content-Type"];
    response = await fetch(url, { method: "POST", headers, body: formData });
  } catch (error) {
    throw new Error(
      `Unable to reach the tools service: ${
        error instanceof Error ? error.message : "network error"
      }`
    );
  }

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
