from typing import List, Optional

from pydantic import BaseModel, Field


class CreativeAssetRequest(BaseModel):
    """Request model for creative marketing asset generation."""

    task_type: str = Field(
        ...,
        description="The type of asset to generate (e.g., 'Product Names', 'Hashtags', 'SEO Titles', 'Slogans')",
    )
    user_query: str = Field(
        ...,
        description="The primary topic, product description, or raw idea",
    )
    context: Optional[str] = Field(
        None,
        description="Target audience, tone, or specific marketing goals",
    )
    reference_examples: Optional[List[str]] = Field(
        None,
        description="Existing titles or hashtags the user likes, used as style reference",
    )
    number_of_suggestions: int = Field(
        default=3,
        ge=1,
        le=20,
        description="The number of unique variations to generate",
    )


class CreativeSuggestion(BaseModel):
    """A single generated creative asset with its rationale."""

    suggestion: str = Field(..., description="The generated name, title, or tag")
    explanation: str = Field(..., description="Why this aligns with the user's preference and is effective")


class CreativeAssetResponse(BaseModel):
    """Response model containing the generated creative assets."""

    suggestions: List[CreativeSuggestion] = Field(..., description="The generated creative assets")
