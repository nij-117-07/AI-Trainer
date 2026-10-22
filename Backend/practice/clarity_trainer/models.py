import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ClarityTrainingSession(BaseModel):
    """
    ORM-style model representing a clarity ("speak less, say more") training session.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique session identifier")
    difficulty: str = Field("medium", description="Difficulty: easy, medium, hard, advanced")
    category: str = Field("", description="Scenario category (e.g., 'difficult conversation')")
    title: str = Field("", description="Scenario title")
    scenario: dict = Field(default_factory=dict, description="Full communication scenario")
    user_response: str = Field("", description="The user's original response")
    quality_score: int = Field(0, ge=0, le=10, description="Coach quality score out of 10")
    word_count: int = Field(0, ge=0, description="Word count of the user's response")
    clarity: str = Field("", description="Clarity rating: excellent, good, fair, poor")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
