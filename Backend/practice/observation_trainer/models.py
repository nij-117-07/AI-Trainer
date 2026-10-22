import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ObservationTrainingSession(BaseModel):
    """
    ORM-style model representing an observation training session.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique session identifier")
    image_ref: str = Field("", description="Reference to the observed image (URL, base64, or path)")
    training_scenario: str = Field("", description="The scenario the user is being trained on")
    user_observations: str = Field("", description="What the user reported observing")
    rating: str = Field("", description="Observation skill rating: Beginner, Intermediate, Advanced, or Expert")
    score: int = Field(0, ge=0, le=10, description="Observation score out of 10")
    missed_details_count: int = Field(0, ge=0, description="Number of hidden details revealed")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
