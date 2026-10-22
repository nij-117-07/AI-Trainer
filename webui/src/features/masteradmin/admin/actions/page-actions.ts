"use server";

import { revalidatePath } from "next/cache";
import { Page } from "@/features/pages/types/page";
import { z } from "zod";
import { readPages, writePages } from "@/lib/db/pages-db";
import { pages as defaultPages } from "@/features/pages/data/pages";

const PageSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  href: z.string().min(1, "URL is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
});

export type PageFormData = z.infer<typeof PageSchema>;

async function seedDb() {
  try {
    const current = await readPages();
    if (!current || current.length === 0) {
      await writePages(defaultPages);
    }
  } catch (error) {
    console.error("Seeding error:", error);
  }
}

export async function getPages(): Promise<Page[]> {
  try {
    await seedDb();
    const pages = await readPages();
    return pages || [];
  } catch (error) {
    console.error("Error reading pages:", error);
    return [];
  }
}

export async function createPage(data: PageFormData): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = PageSchema.parse(data);
    const pages = await readPages();
    
    const newPage: Page = {
      ...validated,
      id: crypto.randomUUID(),
    };
    
    await writePages([newPage, ...pages]);
    revalidatePath("/dashboard");
    revalidatePath("/admin/pages");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to create page" };
  }
}

export async function updatePage(data: PageFormData): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = PageSchema.parse(data);
    if (!validated.id) throw new Error("ID required for update");
    
    const pages = await readPages();
    const index = pages.findIndex((p) => p.id === validated.id);
    
    if (index === -1) {
      return { success: false, error: "Page not found" };
    }
    
    pages[index] = { ...validated } as Page;
    await writePages(pages);
    
    revalidatePath("/dashboard");
    revalidatePath("/admin/pages");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to update page" };
  }
}

export async function deletePage(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const pages = await readPages();
    const filtered = pages.filter((p) => p.id !== id);
    await writePages(filtered);
    
    revalidatePath("/dashboard");
    revalidatePath("/admin/pages");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete page" };
  }
}