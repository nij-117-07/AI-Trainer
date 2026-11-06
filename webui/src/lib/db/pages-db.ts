// src/lib/db/pages-db.ts
/**
 * Database utility for JSON file persistence with error recovery.
 */

import { promises as fs } from "fs";
import path from "path";
import { Page } from "@/features/pages/types/page";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

export async function readPages(): Promise<Page[]> {
  try {
    // Check if file exists
    await fs.access(DB_PATH);
    const data = await fs.readFile(DB_PATH, "utf8");
    
    // Handle empty file
    if (!data || data.trim() === "") {
      console.log("[DB] File empty, returning empty array");
      return [];
    }
    
    const parsed = JSON.parse(data);
    
    // Validate it's an array
    if (!Array.isArray(parsed)) {
      console.error("[DB] Data is not an array:", parsed);
      return [];
    }
    
    console.log(`[DB] Loaded ${parsed.length} pages from JSON`);
    return parsed as Page[];
    
  } catch (error: any) {
    console.error("[DB] Read error:", error?.message || error);
    return [];
  }
}

export async function writePages(pages: Page[]): Promise<void> {
  try {
    if (!Array.isArray(pages)) {
      throw new Error("Data must be an array");
    }
    await fs.writeFile(DB_PATH, JSON.stringify(pages, null, 2), "utf8");
    console.log(`[DB] Saved ${pages.length} pages to JSON`);
  } catch (error) {
    console.error("[DB] Write error:", error);
    throw error;
  }
}

export async function resetToDefaults(defaultPages: Page[]): Promise<void> {
  await writePages(defaultPages);
  console.log("[DB] Reset to default data");
}