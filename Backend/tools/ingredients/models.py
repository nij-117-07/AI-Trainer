import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from tools.ingredients.schemas import HEALTH_LEVEL


class IngredientCheckRecord(BaseModel):
    """
    ORM-style model representing an ingredient health check.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique check identifier")
    file_path: str = Field("", description="Path to the stored source image")
    extracted_ingredients: List[str] = Field(default_factory=list, description="Detected ingredients")
    health_level: HEALTH_LEVEL = Field(..., description="Assigned health level (1-5)")
    risk_factors: List[str] = Field(default_factory=list, description="Concerning items found")
    summary_analysis: str = Field("", description="Why this health level was assigned")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
