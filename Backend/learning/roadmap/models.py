import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class RoadmapSession(BaseModel):
    """
    ORM-style model representing a generated learning roadmap session.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique session identifier")
    subject: str = Field(..., description="The learning topic")
    start_level: str = Field(..., description="Current proficiency")
    target_level: str = Field(..., description="Desired proficiency")
    mode: str = Field("detailed", description="Roadmap comprehensiveness")
    generated_persona_prompt: str = Field("", description="The AI persona system prompt")
    main_topics: List[str] = Field(default_factory=list, description="High-level chapters")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
