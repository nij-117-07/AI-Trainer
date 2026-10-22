from typing import List, Literal, Optional

from pydantic import BaseModel, Field

NegotiationDifficulty = Literal["beginner", "intermediate", "advanced"]
ConcessionWillingness = Literal["high", "medium", "low"]


class ChatMessage(BaseModel):
    """A single message in the negotiation transcript."""

    role: Literal["user", "opponent"] = Field(..., description="Who sent the message")
    message: str = Field(..., description="The message text")


class NegotiationScenario(BaseModel):
    """A generated negotiation practice scenario."""

    title: str = Field(..., description="Catchy scenario title")
    context: str = Field(..., description="Background situation description (2-3 sentences)")
    your_role: str = Field(..., description="The practice user's role/title")
    your_goal: str = Field(..., description="What the user wants to achieve")
    your_constraints: str = Field(..., description="Limits or restrictions the user faces")
    opponent_role: str = Field(..., description="The AI opponent's role/title")
    opponent_goal: str = Field(..., description="What the opponent wants to achieve")
    opponent_constraints: str = Field(..., description="Limits the opponent faces")
    key_issues: List[str] = Field(..., description="List of 2-4 negotiable items/topics")
    starting_stance_opponent: str = Field(
        ...,
        description="How the opponent should open (first message)",
    )


class ScenarioRequest(BaseModel):
    """Request model for generating a negotiation scenario."""

    difficulty: NegotiationDifficulty = Field(
        "intermediate",
        description="Difficulty level: 'beginner', 'intermediate', 'advanced'",
    )
    domain: str = Field(
        ...,
        description="Domain of negotiation (e.g., 'salary', 'real estate', 'business deal', 'diplomatic')",
    )


class ScenarioResponse(BaseModel):
    """Response model containing the generated negotiation scenario."""

    scenario: NegotiationScenario = Field(..., description="The generated scenario")
    opening_message: str = Field(..., description="The opponent's opening message")
    status: str = "success"


class InternalPosition(BaseModel):
    """The opponent's internal state (not shared with the user)."""

    satisfaction: int = Field(..., ge=0, le=10, description="How satisfied the opponent is with progress (0-10)")
    willingness_to_concede: ConcessionWillingness = Field(
        ...,
        description="How willing the opponent is to make further concessions",
    )
    concessions_made: List[str] = Field(..., description="Things the opponent has already given up")
    key_demands: List[str] = Field(..., description="What the opponent still wants")


class OpponentTurnRequest(BaseModel):
    """Request model for getting the opponent's reply to the user's message."""

    scenario: NegotiationScenario = Field(..., description="The scenario being practiced")
    conversation_history: List[ChatMessage] = Field(
        ...,
        description="Full negotiation transcript so far (including this turn's setup)",
    )
    user_last_message: str = Field(..., description="The user's most recent message")


class OpponentTurnResponse(BaseModel):
    """Response model containing the opponent's reply and internal state."""

    response: str = Field(..., description="The opponent's reply, staying in character")
    internal_position: InternalPosition = Field(..., description="The opponent's internal state (not shared with the user)")
    status: str = "success"


class AnalyzeMessageRequest(BaseModel):
    """Request model for analyzing a single trainee message."""

    message: str = Field(..., description="The user's last message to the opponent")
    scenario_context: str = Field(..., description="Brief scenario context")


class AnalyzeMessageResponse(BaseModel):
    """Response model containing the negotiation-tactic analysis of a message."""

    tactics_used: List[str] = Field(..., description="Detected negotiation tactics")
    effectiveness_rating: int = Field(..., ge=1, le=10, description="Message effectiveness rating (1-10)")
    feedback_snippet: str = Field(..., description="One sentence of immediate feedback")
    status: str = "success"


class MessageAnalysis(BaseModel):
    """Embeddable analysis of a single message (used inside a full turn)."""

    tactics_used: List[str] = Field(..., description="Detected negotiation tactics")
    effectiveness_rating: int = Field(..., ge=1, le=10, description="Message effectiveness rating (1-10)")
    feedback_snippet: str = Field(..., description="One sentence of immediate feedback")


class NegotiationTurnRequest(BaseModel):
    """Request model for a combined opponent-reply + message-analysis turn."""

    scenario: NegotiationScenario = Field(..., description="The scenario being practiced")
    conversation_history: List[ChatMessage] = Field(
        ...,
        description="Full negotiation transcript so far (including this turn's setup)",
    )
    user_last_message: str = Field(..., description="The user's most recent message")
    analyze_message: bool = Field(
        True,
        description="Whether to also run message-tactic analysis in the same call",
    )


class NegotiationTurnResponse(BaseModel):
    """Response model containing the opponent's reply and optional message analysis."""

    opponent_reply: str = Field(..., description="The opponent's reply, staying in character")
    internal_position: InternalPosition = Field(..., description="The opponent's internal state (not shared with the user)")
    analysis: Optional[MessageAnalysis] = Field(
        None,
        description="Message-tactic analysis, when requested",
    )
    status: str = "success"


class CategoryScores(BaseModel):
    """Scores (0-10) for each negotiation performance dimension."""

    preparation: int = Field(..., ge=0, le=10, description="Did they understand their role and goals?")
    communication: int = Field(..., ge=0, le=10, description="Were they clear, respectful, professional?")
    strategy: int = Field(..., ge=0, le=10, description="Did they use effective negotiation tactics?")
    listening: int = Field(..., ge=0, le=10, description="Did they respond to the opponent's points?")
    problem_solving: int = Field(..., ge=0, le=10, description="Did they seek creative solutions?")
    flexibility: int = Field(..., ge=0, le=10, description="Were they appropriately flexible?")


class EvaluateSessionRequest(BaseModel):
    """Request model for evaluating a completed negotiation session."""

    scenario: NegotiationScenario = Field(..., description="Full scenario with roles and goals")
    conversation_history: List[ChatMessage] = Field(..., description="Complete negotiation transcript")
    final_outcome: str = Field(..., description="How the negotiation ended (agreement, impasse, etc.)")


class EvaluateSessionResponse(BaseModel):
    """Response model containing the full session feedback evaluation."""

    overall_score: int = Field(..., ge=0, le=100, description="Overall performance score from 0-100")
    scores_by_category: CategoryScores = Field(..., description="Scores for each performance dimension")
    strengths: List[str] = Field(..., description="3-5 things they did well")
    areas_for_improvement: List[str] = Field(..., description="3-5 areas to improve")
    key_takeaways: List[str] = Field(..., description="3 memorable lessons from this session")
    suggested_resources: List[str] = Field(..., description="2-3 book/article/video suggestions")
    status: str = "success"
