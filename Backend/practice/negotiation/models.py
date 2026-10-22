import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class NegotiationSession(BaseModel):
    """
    ORM-style model representing a negotiation practice session.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique session identifier")
    difficulty: str = Field("intermediate", description="Difficulty level: beginner, intermediate, advanced")
    domain: str = Field("", description="Domain of negotiation (e.g., salary, real estate)")
    title: str = Field("", description="Scenario title")
    scenario: dict = Field(default_factory=dict, description="Full negotiation scenario")
    conversation_history: List[dict] = Field(
        default_factory=list,
        description="Transcript of messages, each with 'role' and 'message'",
    )
    final_outcome: str = Field("", description="How the negotiation ended (agreement, impasse, etc.)")
    overall_score: int = Field(0, ge=0, le=100, description="Overall performance score out of 100")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
