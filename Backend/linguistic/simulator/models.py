import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class SimulationRecord(BaseModel):
    """
    ORM-style model representing a behavioral simulation run.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique simulation identifier")
    scenario: str = Field(..., description="The setting or situation")
    response_dialogue: str = Field("", description="The persona's in-character response")
    chosen_action: str = Field("", description="The action taken by the persona")
    emotional_state: str = Field("", description="The persona's mood after the interaction")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
