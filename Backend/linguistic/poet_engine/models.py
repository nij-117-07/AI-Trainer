import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PoetExplanationRecord(BaseModel):
    """
    ORM-style model representing a poetic philology explanation.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique explanation identifier")
    target_language: str = Field(..., description="The source language of the concept")
    native_language: str = Field(..., description="The user's primary language")
    concept_word: str = Field(..., description="The specific word or abstract concept")
    poetic_style: str = Field(..., description="The poetic form used")
    original_poetry: str = Field("", description="The poetic piece in the target language")
    soulful_translation: str = Field("", description="The deep native-language translation")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
