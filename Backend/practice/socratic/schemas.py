from typing import List, Literal, Optional

from pydantic import BaseModel, Field

ConfidenceLevel = Literal["low", "medium", "high", "certain"]


class SocraticRequest(BaseModel):
    """Request model for a Socratic challenge turn."""

    conversation_history: List[str] = Field(default_factory=list, description="List of previous exchanges to maintain context")
    user_statement: str = Field(..., description="The user's latest opinion or rebuttal")
    confidence_level: ConfidenceLevel = Field("medium", description="The user's perceived certainty in their current stance")


class SocraticResponse(BaseModel):
    """Response model containing the logical challenge."""

    logical_fallacy_check: Optional[str] = Field(None, description="If present, name the fallacy; else 'None detected'")
    falsification_question: str = Field(..., description="A pithy question asking what evidence would prove the user wrong")
    edge_case_scenario: str = Field(..., description="A 'What if...' scenario where the user's logic leads to a contradiction")
    refined_perspective: str = Field(..., description="A bridge: 'A more nuanced way to look at this might be...'")
    status: str = "success"
