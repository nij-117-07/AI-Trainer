from typing import List, Literal, Optional

from pydantic import BaseModel, Field

ScenarioDifficulty = Literal["easy", "medium", "hard", "advanced"]
ScenarioCategory = Literal[
    "team update",
    "giving feedback",
    "difficult conversation",
    "pitch or ask",
    "status report",
    "conflict resolution",
    "presentation opening",
    "email",
    "negotiation",
    "apology",
]
VerbosityLevel = Literal["concise", "moderate", "verbose", "redundant"]
ClarityScore = Literal["excellent", "good", "fair", "poor"]


class CommunicationScenario(BaseModel):
    """A generated communication practice scenario."""

    title: str = Field(..., description="Short, punchy title for the scenario")
    situation: str = Field(..., description="Vivid description of the situation (2-4 sentences)")
    characters: List[str] = Field(..., description="People involved and their roles")
    goal: str = Field(..., description="What the user needs to achieve in this conversation")
    constraints: List[str] = Field(..., description="Specific challenges or rules for the response")
    prompt_to_user: str = Field(..., description="The question posed to the user")
    ideal_length_seconds: int = Field(..., ge=0, description="Estimated ideal response time in seconds")
    difficulty: ScenarioDifficulty = Field(..., description="Actual difficulty of this scenario")


class ScenarioRequest(BaseModel):
    """Request model for generating a communication scenario."""

    difficulty: Optional[ScenarioDifficulty] = Field(
        None,
        description="Desired difficulty: easy, medium, hard, advanced. Random if omitted",
    )
    category: Optional[ScenarioCategory] = Field(
        None,
        description="Desired scenario type. Random if omitted",
    )
    user_context: Optional[str] = Field(
        None,
        description="User's role or industry (e.g., 'software engineer', 'manager')",
    )


class ScenarioResponse(BaseModel):
    """Response model containing the generated communication scenario."""

    scenario: CommunicationScenario = Field(..., description="The generated scenario")
    status: str = "success"


class ResponseAnalysis(BaseModel):
    """Analysis of the user's response to the scenario."""

    verbosity: VerbosityLevel = Field(..., description="How verbose the response is")
    word_count: int = Field(..., ge=0, description="Total word count")
    filler_words: List[str] = Field(..., description="Filler or weak words detected")
    redundant_phrases: List[str] = Field(..., description="Repeated ideas or phrases")
    clarity: ClarityScore = Field(..., description="How clear and direct it is")
    goal_achievement: float = Field(..., ge=0.0, le=1.0, description="How well the response achieves the goal (0-1)")
    tone_fit: float = Field(..., ge=0.0, le=1.0, description="How appropriate the tone is for the scenario (0-1)")
    core_message: str = Field(..., description="The single most important point in the response")
    scenario_fit_note: str = Field(..., description="One sentence on scenario-context fit")


class CoachFeedback(BaseModel):
    """Structured, actionable feedback from the critic coach."""

    score: int = Field(..., ge=1, le=10, description="Overall quality score (1-10)")
    what_worked: List[str] = Field(..., description="Up to 3 things done well")
    what_to_cut: List[str] = Field(..., description="Specific phrases or patterns to remove next time")
    what_to_add: List[str] = Field(..., description="Up to 2 missing elements that would make this stronger")
    rewrite_suggestion: str = Field(..., description="One sentence showing how to make it punchier")
    one_principle: str = Field(..., description="A single principle to remember for this type of situation")
    coach_message: str = Field(..., description="Direct, encouraging coach feedback (2-4 sentences)")


class BetterVersion(BaseModel):
    """A concise rewrite of the user's response."""

    rewritten: str = Field(..., description="The improved, concise version")
    original_words: int = Field(..., ge=0, description="Word count of the original")
    new_words: int = Field(..., ge=0, description="Word count of the rewrite")
    percent_reduced: float = Field(..., description="Percentage of words removed")
    why_better: List[str] = Field(..., description="2-3 reasons this version is more effective")


class GoldStandard(BaseModel):
    """The ideal response a master communicator would give."""

    opening: str = Field(..., description="The perfect first sentence/line")
    full_response: str = Field(..., description="The full ideal response")
    why_ideal: List[str] = Field(..., description="3 reasons this response is ideal")
    word_count: int = Field(..., ge=0, description="Word count of the ideal response")
    seconds: int = Field(..., ge=0, description="How long this takes to speak (seconds)")


class EvaluateRequest(BaseModel):
    """Request model for evaluating a user's response to a scenario."""

    scenario: CommunicationScenario = Field(..., description="The scenario the user responded to")
    user_response: str = Field(..., description="The user's actual response")


class EvaluateResponse(BaseModel):
    """Response model containing the full evaluation of the user's response."""

    scenario: CommunicationScenario = Field(..., description="The scenario being practiced")
    user_response: str = Field(..., description="The user's original response")
    analysis: ResponseAnalysis = Field(..., description="Analysis of verbosity, clarity, and effectiveness")
    feedback: CoachFeedback = Field(..., description="Actionable coach feedback")
    better_version: BetterVersion = Field(..., description="A concise rewrite of the response")
    gold_standard: GoldStandard = Field(..., description="The ideal response to learn from")
    status: str = "success"
