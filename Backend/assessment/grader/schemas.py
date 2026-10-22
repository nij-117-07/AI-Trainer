from typing import List, Optional

from pydantic import BaseModel, Field

EXPECTED_LEVEL = str


class GradingPayload(BaseModel):
    """Request payload describing the scenario and the user's submission context."""

    scenario: str = Field(..., example="Handle a difficult customer complaint", description="The context of the task.")
    question_asked: str = Field(..., example="How would you de-escalate this situation?", description="The specific question the user is answering.")
    target_objective: str = Field(..., example="Calm the customer and offer a resolution", description="The goal the user needs to achieve.")
    expected_level: EXPECTED_LEVEL = Field(..., description="Required depth of the answer.")
    user_answer_text: Optional[str] = Field(None, description="The textual part of the user's response.")


class GradingResponse(BaseModel):
    """Response model containing the AI evaluation of the user's submission."""

    combined_analysis: str = Field(..., description="A synthesized summary of the text and image inputs.")
    score: float = Field(..., ge=0.0, le=10.0, description="Score from 0.0 to 10.0.")
    strengths: List[str] = Field(default_factory=list, description="Positive aspects of the submission.")
    weaknesses: List[str] = Field(default_factory=list, description="Gaps or errors found in the submission.")
    detailed_feedback: str = Field(..., description="Constructive advice for improvement.")
    is_target_met: bool = Field(..., description="Whether the objective was achieved.")
    status: str = "success"
