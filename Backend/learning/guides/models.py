import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class GuideTaskRecord(BaseModel):
    """Persistence contract for a single generated task."""

    title: str = Field(..., description="Name of the project/task.")
    description: str = Field(..., description="Detailed explanation of what to build.")
    difficulty: str = Field(..., description="Relative difficulty of the task.")
    learning_outcomes: List[str] = Field(default_factory=list, description="Key concepts the task reinforces.")
    estimated_hours: int = Field(..., ge=1, description="Estimated time to complete.")


class GuideSession(BaseModel):
    """
    ORM-style model representing a generated learning guide session.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique guide session identifier")
    subject: str = Field(..., description="The subject being learned")
    goal: str = Field(..., description="The user's end goal")
    current_level: str = Field(..., description="The user's skill level")
    mentor_feedback: str = Field("", description="The mentor's assessment and rationale")
    tasks: List[GuideTaskRecord] = Field(default_factory=list, description="The generated tasks")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
