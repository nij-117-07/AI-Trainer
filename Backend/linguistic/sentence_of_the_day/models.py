import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class SentenceOfTheDayEntry(BaseModel):
    """
    ORM-style model representing a generated Sentence of the Day entry.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique entry identifier")
    target_language: str = Field(..., description="The language the user is learning")
    native_language: str = Field(..., description="The user's primary language")
    target_sentence: str = Field("", description="The sentence in the target language")
    natural_translation: str = Field("", description="Meaning-based native-language translation")
    date: datetime.date = Field(default_factory=datetime.date.today, description="Day the sentence was generated")
    substitution_options: List[str] = Field(default_factory=list, description="Variations of the sentence")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
