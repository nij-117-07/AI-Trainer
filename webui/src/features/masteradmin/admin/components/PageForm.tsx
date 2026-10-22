// src/features/admin/components/PageForm.tsx
/**
 * Form component for page CRUD operations.
 * Handles validation, tag input, and supports both internal and external URLs.
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageFormData } from "../actions/page-actions";
import { Loader2, X, Globe, Link as LinkIcon } from "lucide-react";

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  href: z.string().min(1, "URL is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
});

interface PageFormProps {
  initialData?: Partial<PageFormData>;
  onSubmit: (data: PageFormData) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
}

export function PageForm({ initialData, onSubmit, onCancel }: PageFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const form = useForm<PageFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: initialData?.id || "",
      title: initialData?.title || "",
      description: initialData?.description || "",
      href: initialData?.href || "",
      category: initialData?.category || "",
      tags: initialData?.tags || [],
    },
  });

  const tags = form.watch("tags");
  const href = form.watch("href");
  const isExternal = href?.startsWith("http");

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
      if (!tags.includes(newTag) && newTag.length > 0) {
        form.setValue("tags", [...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    form.setValue("tags", tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (data: PageFormData) => {
    setIsSubmitting(true);
    try {
      const result = await onSubmit(data);
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Page Title *</Label>
          <Input
            id="title"
            placeholder="e.g., SEO Analytics Tool"
            {...form.register("title")}
            className="bg-white"
          />
          {form.formState.errors.title && (
            <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            placeholder="e.g., Marketing"
            {...form.register("category")}
            className="bg-white"
          />
          {form.formState.errors.category && (
            <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="href" className="flex items-center gap-2">
          URL / Link *
          {isExternal ? (
            <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <Globe className="h-3 w-3" />
              External
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <LinkIcon className="h-3 w-3" />
              Internal
            </span>
          )}
        </Label>
        <Input
          id="href"
          placeholder="https://analytics.example.com or /dashboard/analytics"
          {...form.register("href")}
          className="bg-white font-mono text-sm"
        />
        {form.formState.errors.href && (
          <p className="text-sm text-red-500">{form.formState.errors.href.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Use full URL (https://...) for external websites or path (/...) for internal pages
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe what this page does and who should use it..."
          rows={3}
          {...form.register("description")}
          className="bg-white resize-none"
        />
        {form.formState.errors.description && (
          <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label>Tags * <span className="text-muted-foreground font-normal text-sm">(Press Enter to add)</span></Label>
        <div className="flex flex-wrap gap-2 mb-3 min-h-[2.5rem] p-2 bg-muted/50 rounded-lg border border-border">
          {tags.length === 0 && (
            <span className="text-sm text-muted-foreground italic flex items-center px-2">
              No tags added yet
            </span>
          )}
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 animate-in fade-in zoom-in duration-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-red-500 transition-colors focus:outline-none rounded-full hover:bg-white/50 p-0.5"
                aria-label={`Remove tag ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <Input
          placeholder="Type tag and press Enter..."
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          className="bg-white"
        />
        {form.formState.errors.tags && (
          <p className="text-sm text-red-500">{form.formState.errors.tags.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-6 border-t border-border">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="flex-1 sm:flex-none"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="flex-1 sm:flex-none gap-2"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Saving..." : initialData?.id ? "Update Page" : "Create Page"}
        </Button>
      </div>
    </form>
  );
}