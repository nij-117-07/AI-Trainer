import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class ChartRecord(BaseModel):
    """
    ORM-style model representing a generated Chart.js visualization.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique chart generation identifier")
    data_input: Any = Field(..., description="The raw data used to build the chart")
    custom_instructions: str = Field(..., description="User preferences for chart type, colors, or labels")
    previous_code: Optional[str] = Field(None, description="Prior Chart.js code that was modified")
    answer_message: str = Field("", description="Explanation of the generated chart")
    chart_div_code: str = Field("", description="The generated HTML/JS code block")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
