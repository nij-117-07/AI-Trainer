from typing import Literal

from pydantic import BaseModel, Field

AbstractionDepth = Literal["surface", "structural", "systemic"]


class BridgeRequest(BaseModel):
    """Request model for building a conceptual bridge between two topics."""

    concept_a: str = Field(..., description="First concept (e.g., 'Photosynthesis')")
    concept_b: str = Field(..., description="Second seemingly unrelated concept (e.g., 'Blockchain')")
    abstraction_depth: AbstractionDepth = Field("structural", description="How deep the analogy should be")


class BridgeResponse(BaseModel):
    """Response model containing the conceptual bridge."""

    structural_analogy: str = Field(..., description="Deep structural similarity between the concepts")
    bridging_narrative: str = Field(..., description="A story that connects A to B in 2-3 sentences")
    insight_question: str = Field(..., description="A question that forces the user to find a missing link")
    cognitive_flexibility_score: int = Field(..., ge=1, le=5, description="Estimated transfer learning potential (1-5)")
    status: str = "success"
