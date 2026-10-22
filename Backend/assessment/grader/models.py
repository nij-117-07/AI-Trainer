import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class GradingRecord(BaseModel):
    """
    ORM-style model representing a graded user submission.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique grading session identifier")
    username: str = Field(..., description="User who submitted the answer")
    scenario: str = Field(..., description="The context of the task")
    question_asked: str = Field(..., description="The specific question answered")
    target_objective: str = Field(..., description="The goal the user needed to achieve")
    expected_level: str = Field(..., description="Required depth: beginner, intermediate, or expert")
    score: float = Field(..., ge=0.0, le=10.0, description="AI score from 0.0 to 10.0")
    is_target_met: bool = Field(..., description="Whether the objective was achieved")
    strengths: List[str] = Field(default_factory=list, description="Positive aspects of the submission")
    weaknesses: List[str] = Field(default_factory=list, description="Gaps or errors found")
    detailed_feedback: str = Field("", description="Constructive advice for improvement")
    image_path: Optional[str] = Field(None, description="Persisted copy of the submitted image, if any")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
