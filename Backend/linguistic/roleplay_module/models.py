import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class RoleplaySession(BaseModel):
    """
    ORM-style model representing a roleplay conversation session.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique session identifier")
    persona_name: str = Field("", description="The persona used in the session")
    language: str = Field("English", description="The conversation language")
    history: List[dict] = Field(default_factory=list, description="The conversation history")
    seed: str = Field("", description="Session seed for consistency")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
