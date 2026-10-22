from typing import Any, Optional

from pydantic import BaseModel, Field


class ChartRequest(BaseModel):
    """Request model for Chart.js code generation."""

    data_input: Any = Field(..., description="The raw data (JSON, CSV, or text) to be visualized.")
    custom_instructions: str = Field(..., description="User preferences for chart type, colors, or labels.")
    previous_code: Optional[str] = Field(default=None, description="Existing Chart.js code to modify.")


class ChartResponse(BaseModel):
    """Response model containing the generated Chart.js code."""

    answer_message: str = Field(..., description="A brief explanation of the chart created and how to use it.")
    chart_div_code: str = Field(..., description="The full HTML/JS code block containing the <div>, <canvas>, and Chart.js logic.")
    status: str = Field("success", description="Processing status.")
