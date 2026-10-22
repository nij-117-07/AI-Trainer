import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class DebateSession(BaseModel):
    """
    ORM-style model representing a debate session.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique session identifier")
    topic: str = Field("", description="Core debate question")
    context: str = Field("", description="General theme or background information")
    persona: dict = Field(default_factory=dict, description="The active persona profile")
    side: str = Field("", description="The persona's side: pro or con")
    history: List[Dict[str, str]] = Field(default_factory=list, description="All previous exchanges (role/content)")
    strategy_cycle: List[str] = Field(default_factory=list, description="Turn strategies used in sequence")
    pro_transcript: str = Field("", description="Accumulated Pro-side spoken arguments")
    con_transcript: str = Field("", description="Accumulated Con-side spoken arguments")
    winner: str = Field("", description="Verdict: pro, con, or tie")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
