from typing import Any, Optional

from pydantic import BaseModel, Field


class FlexibleWriterRequest(BaseModel):
    """Request model for the flexible, system-prompt-driven writer."""

    system_prompt: str = Field(..., description="The core persona and rules for the AI")
    input_data: Any = Field(..., description="The primary data/content to be processed or transformed")
    additional_user_input: Optional[str] = Field(None, description="Specific instructions or context from the user")


class FlexibleWriterResponse(BaseModel):
    """Response model containing the transformation result."""

    answer_message: str = Field(..., description="A conversational summary of what was done")
    updated_data: Any = Field(..., description="The structured result or transformed version of the input data")
    status: str = "success"
