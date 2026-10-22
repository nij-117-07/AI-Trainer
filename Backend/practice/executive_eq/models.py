import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class ExecutiveEQSession(BaseModel):
    """
    ORM-style model representing an executive EQ training session.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for the client's session/memory app.
    """

    id: Optional[str] = Field(None, description="Unique session identifier")
    user_role: str = Field("", description="The professional role the user is playing")
    narrative_arc: str = Field("", description="The overarching strategic goal")
    learning_focus: str = Field("strategic_ambiguity", description="The EQ skill being practiced")
    difficulty_level: str = Field("Rising Star", description="The intensity level of the simulation")
    scenario_title: str = Field("", description="Title of the generated scenario")
    setting_description: str = Field("", description="The scenario's setting description")
    npc_profile: Dict[str, str] = Field(default_factory=dict, description="The primary counterpart profile")
    initial_stakes: str = Field("", description="The consequences of failure")
    opening_hook: str = Field("", description="The inciting incident that starts the simulation")
    chat_history: List[Dict[str, str]] = Field(default_factory=list, description="The dialogue so far")
    grades: List[Dict[str, object]] = Field(default_factory=list, description="Evaluation history")
    status_metric: str = Field("Neutral", description="Rolling status position (e.g., 'Holding ground')")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
