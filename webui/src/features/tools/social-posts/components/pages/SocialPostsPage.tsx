// src/features/tools/social-posts/components/pages/SocialPostsPage.tsx
/**
 * Social Media Post Generator tool page. Persisted form wired to the
 * generate Server Action with full loading/error UX.
 */
"use client";

import type { z } from "zod";
import { Megaphone } from "lucide-react";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import {
  InputField,
  SliderField,
  TextareaField,
} from "@/features/learning/explainer/components/fields";
import { SocialPostFormSchema, type SocialPostResponse } from "../../types";
import { generateSocialPostsAction } from "../../actions/generate";
import { SocialPostsResult } from "../results/SocialPostsResult";

type SocialPostFormValues = z.infer<typeof SocialPostFormSchema>;

const STORAGE_KEY = "tools.social-posts.generate.v1";

const DEFAULTS: SocialPostFormValues = {
  system_prompt:
    "You are a witty, tech-savvy ghostwriter for SaaS founders on LinkedIn.",
  platform: "LinkedIn",
  user_query: "The importance of failing fast in software development.",
  chat_history: "",
  liked_post_examples: "",
  num_suggestions: 3,
};

export function SocialPostsPage() {
  const persisted = usePersistedForm<SocialPostFormValues, SocialPostResponse>({
    schema: SocialPostFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<SocialPostFormValues, SocialPostResponse>({
    run: generateSocialPostsAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Social Media Post Generator"
      description="Generate platform-specific post suggestions with designer notes, matched to your brand voice and favorite styles."
      headerAction={
        <DraftStatus
          status={persisted.status}
          onReset={persisted.resetDraft}
          onClear={persisted.clearDraft}
          disabled={tool.isPending}
        />
      }
      form={
        <form onSubmit={persisted.form.handleSubmit(tool.execute)} className="space-y-4">
          <TextareaField
            label="Brand Voice / System Prompt"
            htmlFor="system_prompt"
            placeholder="You are a witty, tech-savvy ghostwriter…"
            disabled={tool.isPending}
            {...persisted.form.register("system_prompt")}
            error={errors.system_prompt?.message}
          />
          <InputField
            label="Platform"
            htmlFor="platform"
            placeholder="e.g. LinkedIn, X, Instagram, Thread"
            disabled={tool.isPending}
            {...persisted.form.register("platform")}
            error={errors.platform?.message}
          />
          <TextareaField
            label="Topic / Goal"
            htmlFor="user_query"
            placeholder="The core topic or goal for the post…"
            disabled={tool.isPending}
            {...persisted.form.register("user_query")}
            error={errors.user_query?.message}
          />
          <TextareaField
            label="Chat History (optional)"
            htmlFor="chat_history"
            placeholder="Earlier context to keep the tone consistent…"
            disabled={tool.isPending}
            {...persisted.form.register("chat_history")}
            error={errors.chat_history?.message}
          />
          <TextareaField
            label="Liked Post Examples (optional)"
            htmlFor="liked_post_examples"
            placeholder="Posts you liked, for style matching…"
            disabled={tool.isPending}
            {...persisted.form.register("liked_post_examples")}
            error={errors.liked_post_examples?.message}
          />
          <SliderField
            label="Number of Suggestions"
            name="num_suggestions"
            htmlFor="num_suggestions"
            control={persisted.form.control}
            min={1}
            max={10}
            formatValue={(value) => `${value} post${value === 1 ? "" : "s"}`}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Generate Posts"
            submitPendingLabel="Writing posts…"
          />
        </form>
      }
      result={
        result ? (
          <SocialPostsResult result={result} />
        ) : (
          <EmptyResult
            icon={Megaphone}
            title="No posts yet"
            description="Describe your brand voice and topic to get tailored post suggestions."
          />
        )
      }
    />
  );
}
