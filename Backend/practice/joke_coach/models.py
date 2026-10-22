import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class JokePracticeSession(BaseModel):
    """
    ORM-style model representing a joke practice session.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for the client's session/memory app.
    """

    id: Optional[str] = Field(None, description="Unique session identifier")
    skill_level: str = Field("beginner", description="User's comedy skill level")
    practice_focus: str = Field("writing", description="Current practice focus")
    goal: str = Field("", description="What the user wants to achieve")
    jokes: List[Dict[str, object]] = Field(default_factory=list, description="Jokes and their metadata")
    evaluations: List[Dict[str, object]] = Field(default_factory=list, description="Feedback history")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
