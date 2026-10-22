import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class AssessmentRecord(BaseModel):
    """
    ORM-style model representing a generated language assessment.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique assessment identifier")
    target_language: str = Field(..., description="The language being tested")
    native_language: str = Field("English", description="The user's native language")
    level: str = Field(..., description="CEFR proficiency level")
    scenario: str = Field(..., description="Context of the assessment")
    assessment_title: str = Field("", description="The generated test title")
    num_questions: int = Field(default=5, description="Number of questions generated")
    seed: str = Field("", description="Seed used for generation")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
