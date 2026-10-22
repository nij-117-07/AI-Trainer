import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ResourceSuggestSession(BaseModel):
    """
    ORM-style model representing a resource suggestion session.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for the client's session/memory app.
    """

    id: Optional[str] = Field(None, description="Unique session identifier")
    background_subject: str = Field("", description="The user's current background or subject area")
    target_topic: str = Field("", description="The topic the user wants to learn")
    additional_preferences: str = Field("", description="Optional learning preferences and constraints")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
