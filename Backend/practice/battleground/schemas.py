from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field

BattleDifficulty = Literal["easy", "medium", "hard"]


class BattleStartRequest(BaseModel):
    """Request model for initializing a battleground simulation."""

    name: str = Field("Commander", description="User's callsign or preferred name")
    expertise: str = Field("", description="User's stated area of expertise or skills")
    preferred_style: str = Field("", description="Preferred combat/strategy style")
    background: str = Field("", description="Background story or experience")
    custom_notes: str = Field("", description="Any additional context about the user")
    topic: str = Field(..., description="The battleground domain/topic")
    difficulty: BattleDifficulty = Field("medium", description="Difficulty: easy, medium, or hard")
    theme: Optional[str] = Field(None, description="Overall theme/tone of the scenario (defaults to topic)")


class BattleStartResponse(BaseModel):
    """Response model containing the full battleground setup to persist."""

    user_profile: Dict[str, object] = Field(..., description="The user's structured combat profile")
    opponent_profile: Dict[str, object] = Field(..., description="The opponent's structured profile")
    opponent_strategy: str = Field(..., description="The opponent's overall strategic approach")
    opponent_first_impression: str = Field(..., description="How the opponent perceives the user")
    scenario_context: str = Field(..., description="Rich narrative background setting the stage")
    battlefield_environment: Dict[str, str] = Field(..., description="Environment details (terrain, weather, etc.)")
    evaluation_criteria: Dict[str, str] = Field(..., description="Metrics for scoring each round")
    mission_objective: str = Field(..., description="The user's overall mission goal")
    rules_of_engagement: List[str] = Field(..., description="Constraints governing the battleground")
    initial_user_health: int = Field(..., ge=0, le=100, description="Starting user HP")
    initial_opponent_health: int = Field(..., ge=0, le=100, description="Starting opponent HP")
    user_resources: Dict[str, int] = Field(..., description="Starting loadout/resources from the user profile")
    status: str = "success"


class BattleChallengeRequest(BaseModel):
    """Request model for generating the next round's tactical challenge."""

    opponent_profile: Dict[str, object] = Field(..., description="The opponent's capabilities and traits")
    battlefield_environment: Dict[str, str] = Field(..., description="Current environment state")
    user_health: int = Field(..., ge=0, le=100, description="User's current health")
    opponent_health: int = Field(..., ge=0, le=100, description="Opponent's current health")
    previous_user_action: str = Field("None yet", description="What the user did last round")
    previous_score: float = Field(0.5, ge=0.0, le=1.0, description="How well the user performed last round")
    round_number: int = Field(1, ge=1, description="Current round number")
    opponent_learning_log: str = Field(
        "Initial reconnaissance phase. Gathering intel on target.",
        description="The opponent's accumulated observations about the user",
    )
    user_profile: Dict[str, object] = Field(..., description="The user's known strengths and weaknesses")
    scenario_context: str = Field(..., description="The overall battleground narrative")


class BattleChallengeResponse(BaseModel):
    """Response model containing the next tactical challenge."""

    tactic_type: str = Field(..., description="The opponent's chosen tactical maneuver")
    briefing: str = Field(..., description="Narrative setup for this encounter")
    tactical_situation: str = Field(..., description="The immediate tactical situation on the ground")
    challenge: str = Field(..., description="What the user must accomplish this round")
    question: str = Field(..., description="The primary problem/decision the user must solve")
    constraints: List[str] = Field(..., description="Operational limits (time, resources, rules)")
    reference_material: Dict[str, str] = Field(..., description="Intelligence artifacts the user must analyze")
    updated_learning_log: str = Field(..., description="Updated opponent observations — persist and pass back")
    environment_change: str = Field(..., description="Change to battlefield conditions, or 'No significant changes.'")
    status: str = "success"


class BattleEvaluateRequest(BaseModel):
    """Request model for evaluating the user's tactical response."""

    scenario_context: str = Field(..., description="Overall battleground narrative")
    battlefield_environment: Dict[str, str] = Field(..., description="Current environment")
    evaluation_criteria: Dict[str, str] = Field(..., description="Scoring metrics")
    current_challenge: str = Field(..., description="What the user was asked to do")
    main_question: str = Field(..., description="The primary problem posed")
    reference_material: Dict[str, str] = Field(..., description="Intel provided to the user")
    user_response: str = Field(..., description="The user's actual response/action")
    user_health: int = Field(..., ge=0, le=100, description="User's current HP")
    opponent_health: int = Field(..., ge=0, le=100, description="Opponent's current HP")
    user_profile: Dict[str, object] = Field(..., description="The user's capabilities")
    opponent_profile: Dict[str, object] = Field(..., description="The opponent's capabilities")
    tactic_used: str = Field(..., description="What the opponent attempted this round")


class BattleEvaluateResponse(BaseModel):
    """Response model containing the adjudication of the user's response."""

    score: float = Field(..., ge=0.0, le=1.0, description="Overall tactical effectiveness (0.0-1.0)")
    feedback: str = Field(..., description="Detailed tactical critique")
    narrative: str = Field(..., description="Story result of this action")
    battlefield_shift: str = Field(..., description="How the tactical situation changes after this round")
    hp_delta_user: int = Field(..., description="Change in user HP (-50 to +10). Negative = damage taken")
    hp_delta_opponent: int = Field(..., description="Change in opponent HP (-30 to 0). Negative = damage dealt")
    resource_impact: Dict[str, int] = Field(..., description="Changes to the user's resources")
    is_terminated: bool = Field(..., description="Whether the simulation should end (per the adjudicator)")
    termination_reason: str = Field(..., description="Why it ended, or empty string if continuing")
    status: str = "success"
