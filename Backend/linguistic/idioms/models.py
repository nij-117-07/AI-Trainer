import datetime
from typing import Optional

from pydantic import BaseModel, Field


class IdiomLessonRecord(BaseModel):
    """
    ORM-style model representing a generated idiom lesson.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique lesson identifier")
    target_language: str = Field(..., description="The language the user wants to learn")
    native_language: str = Field(..., description="The user's primary language")
    theme_or_keyword: str = Field(..., description="The general topic of the idiom")
    idiom_in_target_language: str = Field("", description="The idiom in the target language")
    figurative_meaning: str = Field("", description="The meaning in the native language")
    seed: str = Field("", description="Rotation seed used for the generation")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
