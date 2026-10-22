import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ConceptualBridgeSession(BaseModel):
    """
    ORM-style model representing a conceptual bridge session.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for the client's session/memory app.
    """

    id: Optional[str] = Field(None, description="Unique session identifier")
    user_interest: str = Field("", description="The user's field of interest")
    bridges: List[dict] = Field(default_factory=list, description="Concept pairs and their bridges")
    average_flexibility_score: float = Field(0.0, description="Rolling average of cognitive flexibility scores")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
