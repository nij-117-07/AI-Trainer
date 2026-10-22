from typing import List, Literal

from pydantic import BaseModel, Field

HEALTH_LEVEL = Literal[1, 2, 3, 4, 5]


class IngredientAnalysisResponse(BaseModel):
    """Response model mirroring the DSPy signature outputs."""

    extracted_ingredients: List[str] = Field(..., description="List of detected ingredients.")
    health_level: HEALTH_LEVEL = Field(..., description="The assigned health level (1-5).")
    risk_factors: List[str] = Field(..., description="Concerning additives, allergens, or high-sugar items.")
    summary_analysis: str = Field(..., description="Why this health level was assigned.")
    file_path: str = Field(..., description="Path to the stored source image.")
    status: str = Field("success", description="Processing status.")
