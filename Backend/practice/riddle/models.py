import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class RiddleSession(BaseModel):
    """
    ORM-style model representing a riddle practice session.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for the client's session/memory app.
    """

    id: Optional[str] = Field(None, description="Unique session identifier")
    field_of_interest: str = Field("", description="The topic for riddles")
    solved: int = Field(0, description="Number solved correctly")
    attempted: int = Field(0, description="Number attempted")
    current_difficulty: str = Field("novice", description="Current difficulty tier")
    history: List[dict] = Field(default_factory=list, description="Riddle + result pairs")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
