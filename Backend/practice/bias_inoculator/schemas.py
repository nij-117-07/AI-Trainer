from typing import List, Literal, Optional

from pydantic import BaseModel, Field

TargetBias = Literal["anchoring", "availability", "confirmation", "sunk_cost", "framing"]


class BiasRequest(BaseModel):
    """Request model for generating a bias inoculation scenario."""

    conversation_history: List[str] = Field(default_factory=list, description="Previous scenarios or user reactions")
    user_interest: str = Field(..., description="The user's field (e.g., 'trading', 'dating', 'engineering')")
    target_bias: Optional[TargetBias] = Field(None, description="The bias to train against. If omitted, one is chosen randomly")


class BiasResponse(BaseModel):
    """Response model containing the System 1 vs System 2 training scenario."""

    target_bias: TargetBias = Field(..., description="The bias being trained against")
    scenario_setup: str = Field(..., description="A stealthy scenario that ends with a question for the user")
    intuitive_trap: str = Field(..., description="The 'gut feeling' or biased answer the user likely had")
    rational_analysis: str = Field(..., description="Detailed breakdown of how the bias works and the rational path")
    real_world_application: str = Field(..., description="A practical tip for spotting this bias in their work/life")
    status: str = "success"
