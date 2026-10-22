import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class BattlegroundSession(BaseModel):
    """
    ORM-style model representing a battleground simulation session.

    This mirrors the prototype's Session dataclass as a data contract for the
    client's session/memory app. The backend is stateless: the webapp persists
    this session and passes the relevant fields back on each request.
    """

    id: Optional[str] = Field(None, description="Unique session identifier")
    topic: str = Field("", description="Battleground domain/topic")
    difficulty: str = Field("medium", description="Difficulty: easy, medium, or hard")

    user_details: Dict[str, str] = Field(default_factory=dict, description="Raw user-provided details")
    user_profile: Dict[str, object] = Field(default_factory=dict, description="Structured combat profile")
    user_health: int = Field(100, description="Current user HP")
    user_resources: Dict[str, int] = Field(default_factory=dict, description="User's available resources")

    opponent_profile: Dict[str, object] = Field(default_factory=dict, description="Opponent's profile")
    opponent_strategy: str = Field("", description="Opponent's strategic approach")
    opponent_first_impression: str = Field("", description="Opponent's initial read on the user")
    opponent_health: int = Field(100, description="Current opponent HP")
    opponent_learning_log: str = Field(
        "Initial reconnaissance phase. Gathering intel on target.",
        description="Accumulated observations about the user",
    )

    scenario_context: str = Field("", description="Overall battleground narrative")
    battlefield_environment: Dict[str, str] = Field(default_factory=dict, description="Current environment state")
    evaluation_criteria: Dict[str, str] = Field(default_factory=dict, description="Scoring metrics")
    mission_objective: str = Field("", description="The user's mission goal")
    rules_of_engagement: List[str] = Field(default_factory=list, description="Battleground constraints")

    round_number: int = Field(1, description="Current round number")
    current_challenge: Dict[str, object] = Field(default_factory=dict, description="The active challenge")
    round_scores: List[float] = Field(default_factory=list, description="Per-round scores")
    is_active: bool = Field(True, description="Whether the simulation is ongoing")
    termination_reason: str = Field("", description="Why the simulation ended, if it has")

    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
