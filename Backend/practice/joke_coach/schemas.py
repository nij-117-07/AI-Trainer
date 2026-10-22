from typing import List, Literal, Optional

from pydantic import BaseModel, Field

JokeStyle = Literal["pun", "one-liner", "story", "observational", "dad-joke"]
Appropriateness = Literal["all-ages", "teen", "mature", "nsfw"]
ImprovementGoal = Literal["funnier", "cleaner", "shorter", "more-clever", "better-timing"]
JokeCategory = Literal["pun", "one-liner", "story-joke", "observational", "self-deprecating", "dad-joke", "dark-humor", "anti-joke"]
HumorMechanism = Literal["wordplay", "misdirection", "exaggeration", "irony", "rule-of-three", "callback", "subversion"]
SkillLevel = Literal["beginner", "intermediate", "advanced"]
PracticeFocus = Literal["writing", "delivery", "timing", "crowd-work", "stage-presence", "all"]
VenueType = Literal["comedy-club", "open-mic", "corporate-event", "family-gathering", "college-show"]
CrowdReaction = Literal["huge-laugh", "solid-laugh", "chuckles", "polite-smile", "silence", "groan"]


class GenerateJokeRequest(BaseModel):
    """Request model for generating a joke."""

    topic: str = Field(..., description="The subject or theme for the joke")
    joke_style: JokeStyle = Field("dad-joke", description="Preferred joke format or style")
    audience: str = Field("general", description="Target audience")


class GenerateJokeResponse(BaseModel):
    """Response model containing a generated joke."""

    joke: str = Field(..., description="The generated joke text")
    setup: str = Field(..., description="The setup/premise of the joke")
    punchline: str = Field(..., description="The punchline or payoff of the joke")
    humor_type: str = Field(..., description="Type of humor used (wordplay, irony, exaggeration, etc.)")
    difficulty_rating: int = Field(..., ge=1, le=5, description="Delivery difficulty (1=easy, 5=advanced timing)")
    status: str = "success"


class EvaluateJokeRequest(BaseModel):
    """Request model for evaluating a joke."""

    joke: str = Field(..., description="The complete joke text to evaluate")
    intended_audience: str = Field("general", description="Who this joke was meant for")
    context: Optional[str] = Field(None, description="Additional context (e.g., 'open mic night', 'family dinner')")


class EvaluateJokeResponse(BaseModel):
    """Response model containing structured joke feedback."""

    overall_score: float = Field(..., ge=0.0, le=10.0, description="Overall quality score (0.0-10.0)")
    humor_score: float = Field(..., ge=0.0, le=10.0, description="How funny it is (0.0-10.0)")
    originality_score: float = Field(..., ge=0.0, le=10.0, description="How original/creative it is (0.0-10.0)")
    delivery_score: float = Field(..., ge=0.0, le=10.0, description="How easy it is to deliver well (0.0-10.0)")
    appropriateness: Appropriateness = Field(..., description="Content appropriateness level")
    strengths: List[str] = Field(..., description="What works well in this joke")
    weaknesses: List[str] = Field(..., description="Areas for improvement")
    feedback: str = Field(..., description="Detailed constructive feedback paragraph")
    is_recommended: bool = Field(..., description="Whether this joke is ready to perform")
    status: str = "success"


class RewriteJokeRequest(BaseModel):
    """Request model for rewriting/improving a joke."""

    original_joke: str = Field(..., description="The original joke text to improve")
    improvement_goal: ImprovementGoal = Field(..., description="What aspect to improve")
    target_audience: str = Field(..., description="Who should find this funny")


class RewriteJokeResponse(BaseModel):
    """Response model containing the improved joke."""

    rewritten_joke: str = Field(..., description="The improved version of the joke")
    setup: str = Field(..., description="New setup/premise")
    punchline: str = Field(..., description="New punchline")
    changes_made: List[str] = Field(..., description="Specific improvements made")
    performance_notes: str = Field(..., description="Tips for delivering this joke effectively")
    status: str = "success"


class ClassifyJokeRequest(BaseModel):
    """Request model for classifying a joke."""

    joke: str = Field(..., description="The joke text to classify")


class ClassifyJokeResponse(BaseModel):
    """Response model containing joke categorization."""

    style: JokeCategory = Field(..., description="Primary joke style")
    humor_mechanism: HumorMechanism = Field(..., description="How the humor works")
    structure: str = Field(..., description="Structural breakdown (setup -> turn -> punchline)")
    tags: List[str] = Field(..., description="Relevant tags for categorization")
    practice_category: SkillLevel = Field(..., description="Suggested practice level based on complexity")
    similar_joke_styles: List[str] = Field(..., description="Other styles this joke resembles")
    status: str = "success"


class PracticeCoachRequest(BaseModel):
    """Request model for a joke practice session."""

    current_skill_level: SkillLevel = Field(..., description="User's current comedy skill level")
    practice_focus: PracticeFocus = Field(..., description="What area to focus on in this session")
    user_joke: Optional[str] = Field(None, description="The user's joke to practice with")
    session_goal: str = Field(..., description="What the user wants to achieve in this practice session")


class PracticeCoachResponse(BaseModel):
    """Response model containing a structured practice session."""

    exercise_type: str = Field(..., description="Recommended exercise type")
    exercise_instructions: str = Field(..., description="Step-by-step instructions for the exercise")
    practice_joke: Optional[str] = Field(None, description="A joke to practice with, if the user didn't provide one")
    drill_prompt: str = Field(..., description="Specific drill or prompt for immediate practice")
    success_criteria: List[str] = Field(..., description="How to know if the practice was successful")
    next_steps: List[str] = Field(..., description="Recommended next practice steps")
    status: str = "success"


class CrowdSimulationRequest(BaseModel):
    """Request model for simulating crowd response."""

    joke: str = Field(..., description="The joke to simulate responses for")
    venue_type: VenueType = Field(..., description="Type of venue/setting")
    audience_demographic: str = Field(..., description="Description of the expected audience")


class CrowdSimulationResponse(BaseModel):
    """Response model containing the predicted crowd reaction."""

    predicted_response: CrowdReaction = Field(..., description="Expected crowd reaction level")
    laugh_probability: float = Field(..., ge=0.0, le=1.0, description="Probability of getting laughs (0.0-1.0)")
    best_delivery_style: str = Field(..., description="Recommended delivery approach")
    potential_risks: List[str] = Field(..., description="What could go wrong with this joke")
    alternative_punchline: Optional[str] = Field(None, description="Backup punchline if the main one fails")
    crowd_work_opportunity: str = Field(..., description="How to engage the crowd around this joke")
    status: str = "success"
