from typing import List, Literal

from pydantic import BaseModel, Field

Verdict = Literal["Likely AI", "Likely Human", "Mixed"]


class AIDetectionRequest(BaseModel):
    """Request model for analysing text for AI-generated content."""

    text_to_check: str = Field(
        ...,
        min_length=1,
        max_length=50_000,
        description="The text to analyze for AI-generated content.",
    )
    additional_comments: str = Field(
        default="",
        max_length=2_000,
        description=(
            "Optional extra context from the user — e.g., where the text came "
            "from, what tool might have written it, or specific concerns."
        ),
    )


class AIDetectionResponse(BaseModel):
    """Response model containing the structured AI detection result."""

    ai_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="AI probability score from 0.0 (fully human) to 1.0 (fully AI).",
    )
    verdict: Verdict = Field(..., description="Final verdict on whether the text is AI-generated.")
    reason: str = Field(..., description="Detailed explanation of why this score was given.")
    flagged_patterns: List[str] = Field(
        default_factory=list,
        description="Specific AI-telltale patterns detected in the text.",
    )
    suggested_changes: List[str] = Field(
        default_factory=list,
        description="Actionable suggestions to rewrite the text so it sounds more human.",
    )


class HumanizerRequest(BaseModel):
    """Request model for rewriting AI-sounding text into human-sounding text."""

    ai_text: str = Field(
        ...,
        min_length=1,
        max_length=50_000,
        description="The AI-sounding text that needs to be humanized.",
    )
    target_tone: str = Field(
        default="conversational",
        max_length=100,
        description=(
            "Desired tone for the output (e.g., casual, professional, "
            "conversational, academic, witty)."
        ),
    )
    detection_feedback: str = Field(
        default="",
        max_length=5_000,
        description=(
            "Optional feedback from the AI Detector — flagged patterns and "
            "suggested changes to specifically address."
        ),
    )
    additional_comments: str = Field(
        default="",
        max_length=2_000,
        description=(
            "Optional extra instructions from the user — e.g., preserve certain "
            "phrasing, target audience, or contextual constraints."
        ),
    )


class HumanizerResponse(BaseModel):
    """Response model containing the humanized text and its metadata."""

    humanized_text: str = Field(
        ...,
        description="The rewritten text that sounds natural and human-written.",
    )
    changes_made: List[str] = Field(
        default_factory=list,
        description="Specific changes made and why they help the text sound more human.",
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence that the rewritten text would pass as human-written.",
    )
