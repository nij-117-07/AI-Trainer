import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class WordOfTheDayEntry(BaseModel):
    """
    ORM-style model representing a generated Word of the Day entry.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique entry identifier")
    target_language: str = Field(..., description="The language of the chosen word")
    native_language: str = Field("English", description="User's primary language for explanations")
    word: str = Field("", description="The chosen word")
    native_translation: str = Field("", description="Closest native-language equivalent")
    date: datetime.date = Field(default_factory=datetime.date.today, description="Day the word was generated")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
