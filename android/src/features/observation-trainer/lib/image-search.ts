// src/features/observation-trainer/lib/image-search.ts
/**
 * Keyless image search on Wikimedia Commons, plus loading one found image for the model. Only
 * JPEG, PNG, and WebP files are kept, since those are what the image resizer can read.
 */
import { File, Paths } from "expo-file-system";
import { fetchWithTimeout, toFormBody } from "@/features/web-search/lib/http";
import { resizeImage, type ImageInput } from "@/lib/image";
import type { ImageCandidate } from "../types";
import { isRecord, numberOf, textOf } from "./text";

const API_URL = "https://commons.wikimedia.org/w/api.php";
const REQUEST_TIMEOUT_MS = 15_000;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_ARTIST_CHARS = 120;

/** Returns up to `limit` candidate photos for a query, most relevant first. */
export async function searchCommonsImages(query: string, limit: number): Promise<ImageCandidate[]> {
  const url = `${API_URL}?${toFormBody([
    ["action", "query"],
    ["generator", "search"],
    ["gsrnamespace", "6"],
    ["gsrsearch", `${query} filetype:bitmap`],
    ["gsrlimit", String(limit)],
    ["prop", "imageinfo"],
    ["iiprop", "url|size|mime|extmetadata"],
    ["iiurlwidth", "1024"],
    ["formatversion", "2"],
    ["format", "json"],
    ["origin", "*"],
  ])}`;
  const response = await fetchWithTimeout("Wikimedia Commons", url, { method: "GET" }, REQUEST_TIMEOUT_MS);
  if (!response.ok) {
    throw new Error(`Wikimedia Commons request failed (HTTP ${response.status}).`);
  }
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Wikimedia Commons returned an unexpected response. Try again shortly.");
  }
  return parseCommonsResults(payload);
}

function metadataText(extmetadata: unknown, key: string): string {
  const entry = isRecord(extmetadata) ? extmetadata[key] : undefined;
  const value = isRecord(entry) ? textOf(entry.value) : "";
  return value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function titleFrom(raw: string): string {
  return raw
    .replace(/^File:/i, "")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/_/g, " ")
    .trim();
}

/** Reads a Commons `query.pages` payload, skipping files that are not usable photos. */
export function parseCommonsResults(payload: unknown): ImageCandidate[] {
  const query = isRecord(payload) ? payload.query : undefined;
  const pages = isRecord(query) && Array.isArray(query.pages) ? query.pages : [];

  return pages
    .filter(isRecord)
    .sort((a, b) => (numberOf(a.index) ?? 0) - (numberOf(b.index) ?? 0))
    .flatMap((page): ImageCandidate[] => {
      const info = Array.isArray(page.imageinfo) && isRecord(page.imageinfo[0]) ? page.imageinfo[0] : null;
      if (!info || !ALLOWED_MIME.has(textOf(info.mime))) return [];
      const imageUrl = textOf(info.thumburl) || textOf(info.url);
      const width = numberOf(info.thumbwidth) ?? numberOf(info.width);
      const height = numberOf(info.thumbheight) ?? numberOf(info.height);
      if (!imageUrl || !/^https:\/\//i.test(imageUrl) || !width || !height) return [];
      const id = numberOf(page.pageid);
      if (id === null) return [];
      return [
        {
          id: String(id),
          title: titleFrom(textOf(page.title)),
          imageUrl,
          width,
          height,
          pageUrl: textOf(info.descriptionurl),
          license: metadataText(info.extmetadata, "LicenseShortName"),
          artist: metadataText(info.extmetadata, "Artist").slice(0, MAX_ARTIST_CHARS),
        },
      ];
    });
}

/** Downloads a found image and resizes it to the same JPEG form as an uploaded picture. */
export async function loadCandidateImage(candidate: ImageCandidate): Promise<ImageInput> {
  const download = await File.downloadFileAsync(candidate.imageUrl, Paths.cache);
  return resizeImage({ uri: download.uri, width: candidate.width, height: candidate.height });
}
