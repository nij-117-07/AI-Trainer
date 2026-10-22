import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class MotivationRecord(BaseModel):
    """
    ORM-style model representing a generated motivational quote.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique motivation session identifier")
    seed_topic: str = Field(..., description="Keyword or topic that anchored the quote")
    quote_type: str = Field(..., description="Style of the quote")
    user_feeling: str = Field(..., description="The user's emotional state")
    quote: str = Field("", description="The generated motivational quote")
    author_persona: str = Field("", description="The persona attributed to the quote")
    actionable_insight: str = Field("", description="The micro-habit suggested to the user")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True


class ReflectionRecord(BaseModel):
    """
    ORM-style model representing a generated journaling reflection session.
    """

    id: Optional[str] = Field(None, description="Unique reflection session identifier")
    current_mood: str = Field(..., description="The user's emotional state")
    goal_alignment: str = Field(..., description="The goal or value in focus")
    recent_patterns: Optional[str] = Field(None, description="Summarized mood or progress trends")
    prompts: List[str] = Field(default_factory=list, description="The generated journaling questions")
    perspective_shift: str = Field("", description="The reframing thought")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
