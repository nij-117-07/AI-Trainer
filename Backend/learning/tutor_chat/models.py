import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class TutorChatSession(BaseModel):
    """
    ORM-style model representing a topic-scoped tutoring chat session.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for the client's session/memory app.
    """

    id: Optional[str] = Field(None, description="Unique session identifier")
    master_topic: str = Field("", description="The main subject being learned")
    additional_context: str = Field("", description="User's background, goals, or learning style constraints")
    chat_history: List[Dict[str, str]] = Field(
        default_factory=list,
        description="All previous {role, content} turns",
    )
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
