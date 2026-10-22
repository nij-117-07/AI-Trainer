import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ExplanationSession(BaseModel):
    """
    ORM-style model representing an explanation session.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique session identifier")
    topic: str = Field(..., description="The subject that was explained")
    expertise_level: str = Field(..., description="Target audience knowledge level")
    explanation: str = Field("", description="The generated explanation content")
    key_takeaway: str = Field("", description="One-sentence summary of the core concept")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
