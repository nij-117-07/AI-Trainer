import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class LessonRecord(BaseModel):
    """
    ORM-style model representing a generated language lesson.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique lesson identifier")
    native_language: str = Field(..., description="The user's primary language")
    target_language: str = Field(..., description="The language the user is learning")
    current_level: str = Field(..., description="CEFR proficiency level")
    learning_focus: str = Field(..., description="The pedagogical focus of the lesson")
    lesson_header: str = Field("", description="The creative lesson title")
    vocabulary: List[dict] = Field(default_factory=list, description="The thematic vocabulary list")
    seed: str = Field("", description="Variety seed used for generation")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
