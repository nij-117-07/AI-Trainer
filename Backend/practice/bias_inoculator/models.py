import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class BiasInoculatorSession(BaseModel):
    """
    ORM-style model representing a bias training session.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for the client's session/memory app.
    """

    id: Optional[str] = Field(None, description="Unique session identifier")
    user_interest: str = Field("", description="The user's field of interest")
    trained_biases: List[str] = Field(default_factory=list, description="Biases already covered")
    scenario_history: List[dict] = Field(default_factory=list, description="Scenario + user response pairs")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
