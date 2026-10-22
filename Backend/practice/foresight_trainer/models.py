import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class ForesightSession(BaseModel):
    """
    ORM-style model representing a foresight training session.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique session identifier")
    theme: str = Field("", description="The core theme or skill being trained")
    difficulty: str = Field("intermediate", description="Desired difficulty: beginner, intermediate, advanced")
    max_scenes: int = Field(5, description="Maximum number of scenes before the progress report")
    blueprint: dict = Field(default_factory=dict, description="The scenario blueprint from /start")
    scene_number: int = Field(1, description="The current scene number")
    scene: dict = Field(default_factory=dict, description="The current scene and decision point")
    options: List[Dict[str, object]] = Field(default_factory=list, description="The options for the current scene")
    decision_history: List[Dict[str, object]] = Field(
        default_factory=list,
        description="All recorded decisions and evaluations",
    )
    progress_report: Optional[Dict[str, object]] = Field(None, description="Final progress report when complete")
    is_complete: bool = Field(False, description="Whether the scenario has finished")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
