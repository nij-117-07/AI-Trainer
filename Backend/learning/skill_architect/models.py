import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class SkillArchitectSession(BaseModel):
    """
    ORM-style model representing a generated root-skill tree session.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique session identifier")
    domain_or_skill: str = Field("", description="The main subject, craft, or profession")
    current_proficiency: str = Field("", description="The user's current level")
    target_mastery_level: str = Field("", description="The desired end goal")
    learning_constraints: str = Field("", description="Time, resource, or style constraints")
    core_philosophy: str = Field("", description="The fundamental mental model of the domain")
    skill_tree_levels: List[Dict[str, object]] = Field(
        default_factory=list,
        description="The structured, level-wise progression tree",
    )
    critical_bottleneck: str = Field("", description="The root concept most people fail to grasp")
    strategic_navigation: str = Field("", description="Actionable practice and acceleration advice")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
