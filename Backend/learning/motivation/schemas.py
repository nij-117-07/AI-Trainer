from typing import List, Literal, Optional

from pydantic import BaseModel, Field

QUOTE_TYPES = Literal["stoic", "modern", "poetic", "tough-love"]


class MotivationRequest(BaseModel):
    """Request model for generating a personalized motivational quote."""

    seed_topic: str = Field(..., example="Resilience", description="Keyword or topic to anchor the quote.")
    quote_type: QUOTE_TYPES = Field(..., example="stoic", description="Style of the quote.")
    user_feeling: str = Field(..., example="I feel overwhelmed.", description="The user's emotional state.")


class MotivationResponse(BaseModel):
    """Response model containing the generated quote and reflection."""

    quote: str = Field(..., description="The generated motivational quote.")
    author_persona: str = Field(..., description="The persona attributed to the quote.")
    actionable_insight: str = Field(..., description="A one-sentence micro-habit the user can take now.")
    current_date: str = Field(..., description="Today's date used to contextualize the quote.")


class ReflectionRequest(BaseModel):
    """Request model for generating journaling reflection prompts."""

    current_mood: str = Field(..., example="Anxious about work.", description="The user's current emotional state.")
    goal_alignment: str = Field(..., example="Creative independence.", description="The goal or value to focus on.")
    recent_patterns: Optional[str] = Field(None, example="High energy in mornings, crash by 3 PM.", description="Summarized mood or progress trends.")


class ReflectionResponse(BaseModel):
    """Response model containing journaling prompts and a perspective shift."""

    prompts: List[str] = Field(..., min_length=3, max_length=3, description="Three open-ended journaling questions.")
    perspective_shift: str = Field(..., description="A 'What if' sentence to reframe the user's challenge.")
