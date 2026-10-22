from typing import Literal, Optional

from pydantic import BaseModel, Field

PuzzleType = Literal["riddle", "logic grid", "sequence", "wordplay", "cipher"]
CognitiveDomain = Literal["verbal", "mathematical", "spatial", "lateral"]
DifficultyLevel = Literal["novice", "intermediate", "expert", "genius"]


class PuzzleRequest(BaseModel):
    """Request model for generating a personalized cognitive puzzle."""

    field_of_interest: str = Field(..., description="The thematic topic (e.g., 'Cyberpunk', 'Ancient Egypt', 'Quantum Physics')")
    puzzle_type: PuzzleType = Field(..., description="The specific format of the puzzle")
    target_domain: CognitiveDomain = Field(..., description="The primary cognitive skill the puzzle should exercise")
    difficulty_level: DifficultyLevel = Field(..., description="The depth of reasoning required to solve the puzzle")


class PuzzleResponse(BaseModel):
    """Response model containing a generated puzzle."""

    puzzler_persona: str = Field(..., description="A short flavor-text description of the entity presenting the puzzle")
    puzzle_text: str = Field(..., description="The actual content of the puzzle or brain teaser")
    solution: str = Field(..., description="The correct answer with a step-by-step logical breakdown")
    cognitive_trigger: str = Field(..., description="Analysis of the mental 'trap' or insight required to solve it")
    status: str = "success"


class PuzzleEvaluationRequest(BaseModel):
    """Request model for evaluating a puzzle attempt."""

    puzzle_context: str = Field(..., description="The full text of the puzzle")
    puzzle_type: PuzzleType = Field(..., description="Type of puzzle (e.g., cipher, logic grid)")
    official_solution: str = Field(..., description="The factual correct answer and logic")
    user_response: str = Field(..., description="The user's input/answer")


class PuzzleEvaluationResponse(BaseModel):
    """Response model containing the evaluation of a puzzle attempt."""

    is_correct: bool = Field(..., description="Boolean indicating if the answer matches the solution's logic")
    accuracy_score: float = Field(..., ge=0.0, le=1.0, description="How close the user was (0.0-1.0)")
    evaluation_feedback: str = Field(..., description="Encouraging feedback pointing out the logical flaw if wrong")
    hint_redirection: Optional[str] = Field(None, description="A nudge toward the right path, only if incorrect")
    metacognitive_prompt: str = Field(..., description="A question to help the user rethink their approach")
    status: str = "success"
