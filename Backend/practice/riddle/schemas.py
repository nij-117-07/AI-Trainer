from typing import Literal

from pydantic import BaseModel, Field

CognitiveDomain = Literal["verbal", "mathematical", "spatial", "lateral"]
DifficultyLevel = Literal["novice", "intermediate", "expert", "genius"]


class RiddleRequest(BaseModel):
    """Request model for generating an adaptive riddle."""

    field_of_interest: str = Field(..., description="The topic (e.g., 'Space', 'Ancient Architecture')")
    target_domain: CognitiveDomain = Field(..., description="The cognitive domain to challenge")
    difficulty_level: DifficultyLevel = Field(..., description="Current difficulty tier")


class RiddleResponse(BaseModel):
    """Response model containing a generated riddle."""

    riddle_text: str = Field(..., description="The riddle/puzzle text")
    solution: str = Field(..., description="Clear explanation of the logic")
    cognitive_trigger: str = Field(..., description="The mental hook being trained")
    status: str = "success"


class EvaluationRequest(BaseModel):
    """Request model for evaluating a riddle answer."""

    riddle_text: str = Field(..., description="The original riddle")
    solution: str = Field(..., description="The correct answer")
    user_answer: str = Field(..., description="The user's attempt or request for help")


class EvaluationResponse(BaseModel):
    """Response model containing answer feedback."""

    is_correct: bool = Field(..., description="True if the answer is logically correct")
    feedback: str = Field(..., description="Feedback or a hint if incorrect. Never reveals the answer")
    thought_redirection: str = Field(..., description="Instruction on how to shift their perspective")
    status: str = "success"
