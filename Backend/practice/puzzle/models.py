import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class PuzzleSession(BaseModel):
    """
    ORM-style model representing a puzzle practice session.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for the client's session/memory app.
    """

    id: Optional[str] = Field(None, description="Unique session identifier")
    field_of_interest: str = Field("", description="The thematic topic for puzzles")
    solved: int = Field(0, description="Number solved correctly")
    attempted: int = Field(0, description="Number attempted")
    accuracy: float = Field(0.0, description="Rolling average accuracy (0.0-1.0)")
    current_difficulty: str = Field("novice", description="Current difficulty tier")
    history: List[dict] = Field(default_factory=list, description="Puzzle + result pairs")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
