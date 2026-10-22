from typing import List, Optional

from pydantic import BaseModel, Field


class ResourceItem(BaseModel):
    """A single curated learning resource."""

    title: str = Field(..., description="The exact name of the resource.")
    type: str = Field(
        ...,
        description="Category: book, youtube_video, blog_post, online_course, documentation, podcast, github_repo, or paper.",
    )
    author_or_creator: str = Field(default="", description="Who created the resource, if known.")
    description: str = Field(default="", description="What the resource covers and its key focus.")
    difficulty_level: str = Field(
        default="",
        description="beginner, intermediate, or advanced.",
    )
    estimated_time: str = Field(
        default="",
        description="Approximate time to complete (e.g. '3 hours', '2 weeks').",
    )
    why_recommended: str = Field(
        default="",
        description="Specific reason this resource fits the learner's background and goals.",
    )
    prerequisite_knowledge: str = Field(
        default="",
        description="What the learner should know before starting this resource.",
    )
    access_info: str = Field(
        default="",
        description="How to access it (URL, platform name, or 'search for: [title]').",
    )


class ResourceSuggestRequest(BaseModel):
    """Request model for personalized resource suggestions."""

    background_subject: str = Field(
        ...,
        description="The subject or domain the user is currently studying or has background knowledge in.",
    )
    target_topic: str = Field(
        ...,
        description="The specific topic or skill the user wants to learn.",
    )
    additional_preferences: Optional[str] = Field(
        None,
        description=(
            "Optional preferences like learning style (visual/auditory/reading), "
            "time commitment (hours per week), difficulty preference, format preference, "
            "language, or any other constraints."
        ),
    )


class ResourceSuggestResponse(BaseModel):
    """Response model containing learning path and recommended resources."""

    learning_path_summary: str = Field(
        ...,
        description="A brief overview of the recommended learning approach and progression strategy.",
    )
    recommended_resources: List[ResourceItem] = Field(
        default_factory=list,
        description="A curated list of 5-8 learning resources.",
    )
    next_steps: str = Field(
        ...,
        description="Suggested order to consume the resources and what to do after completing them.",
    )
    status: str = "success"
