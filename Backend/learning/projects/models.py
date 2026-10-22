import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from learning.projects.schemas import DIFFICULTY_LEVEL, PROJECT_SIZE


class ProjectRecommendationRecord(BaseModel):
    """
    ORM-style model representing a learning project recommendation run.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique recommendation identifier")
    topic: str = Field(..., description="The subject or technology to practice")
    project_size: PROJECT_SIZE = Field(..., description="Desired project scope")
    difficulty_level: DIFFICULTY_LEVEL = Field(..., description="Learner's proficiency")
    projects: List[dict] = Field(default_factory=list, description="The recommended projects")
    advice: str = Field("", description="Advice on how to approach the chosen project")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
