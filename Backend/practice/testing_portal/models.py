import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class TestingPortalSession(BaseModel):
    """
    ORM-style model representing a testing portal session.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique session identifier")
    topic: str = Field(..., description="The subject or domain of the session")
    context_setting: str = Field("", description="The scenario for the questions")
    generated_mcqs: List[Dict[str, object]] = Field(default_factory=list, description="Generated multiple choice questions")
    generated_theoretical: List[Dict[str, object]] = Field(default_factory=list, description="Generated theoretical questions")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
