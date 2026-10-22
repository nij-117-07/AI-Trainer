import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class RoleplayChatSession(BaseModel):
    """
    ORM-style model representing a roleplay chat session.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for the client's session/memory app.
    """

    id: Optional[str] = Field(None, description="Unique session identifier")
    system_prompt: str = Field("", description="The character's persona definition")
    character_name: str = Field("Character", description="Display name of the character")
    chat_history: List[Dict[str, str]] = Field(
        default_factory=list,
        description="All previous {role, content} turns",
    )
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
