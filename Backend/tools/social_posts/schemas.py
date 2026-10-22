from typing import List, Optional

from pydantic import BaseModel, Field


class SocialPostRequest(BaseModel):
    """Request model for social media post generation."""

    system_prompt: str = Field(
        ...,
        description="The persona and brand voice rules.",
    )
    platform: str = Field(
        ...,
        example="LinkedIn",
        description="Target platform (e.g., LinkedIn, X, Instagram, Thread)",
    )
    user_query: str = Field(
        ...,
        description="The core topic or goal for the post",
    )
    chat_history: Optional[str] = Field(
        None,
        description="Past interactions to maintain context",
    )
    liked_post_examples: Optional[str] = Field(
        None,
        description="Examples of posts the user liked for style matching",
    )
    num_suggestions: int = Field(
        default=3,
        ge=1,
        le=10,
        description="Number of post variants to generate",
    )


class PostSuggestion(BaseModel):
    """A single generated post variant."""

    variant_id: str = Field(..., description="A number or label (e.g., '1')")
    content: str = Field(..., description="The actual post body content")
    designer_notes: str = Field(..., description="Why this post works for the platform")


class SocialPostResponse(BaseModel):
    """Response model containing the generated post suggestions."""

    user_message: str = Field(..., description="A friendly, conversational message explaining the strategy behind these posts")
    post_suggestions: List[PostSuggestion] = Field(..., description="The generated post variants")
