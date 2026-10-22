import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TranslationRecord(BaseModel):
    """
    ORM-style model representing a contextual translation request.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique translation identifier")
    source_language: str = Field(..., description="The language of the input text")
    target_language: str = Field(..., description="The language of the output text")
    tone: str = Field(..., description="The desired style of the translation")
    text_to_translate: str = Field("", description="The source text")
    translated_text: str = Field("", description="The final translated content")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
