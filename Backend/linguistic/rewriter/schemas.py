from typing import List, Literal, Optional

from pydantic import BaseModel, Field

TRANSFORMATION_GOAL = Literal["paraphrase", "shorten", "expand", "simplify"]


class RewriteRequest(BaseModel):
    """Request model for text rewriting."""

    original_text: str = Field(..., description="The text to rewrite")
    target_tone: str = Field(..., description="Tone like 'professional' or 'witty'")
    audience: str = Field(..., description="The target demographic")
    transformation_goal: TRANSFORMATION_GOAL = Field(..., description="The primary objective of the rewrite")
    custom_instructions: Optional[str] = Field(None, description="Specific constraints or rules")


class RewriteResponse(BaseModel):
    """Response model containing the rewritten text and its metadata."""

    rationale: str = Field(..., description="Explanation of the stylistic changes made")
    rewritten_text: str = Field(..., description="The final polished version of the text")
    improvements_made: List[str] = Field(..., description="A list of specific changes made")
