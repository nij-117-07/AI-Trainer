from typing import Literal, Optional

from pydantic import BaseModel, Field

DiagramFormat = Literal["mermaid", "drawio"]


class DiagramRequest(BaseModel):
    """Request model for diagram code generation."""

    format: DiagramFormat = Field(..., description="Diagram format: 'mermaid' or 'drawio'")
    instruction: str = Field(..., description="Specific visual change or diagram request")
    context: Optional[str] = Field(
        default="",
        description="Business logic or technical context for the diagram content",
    )
    existing_code: Optional[str] = Field(
        default="",
        description="Existing diagram code to refine (empty to generate from scratch)",
    )


class DiagramResponse(BaseModel):
    """Response model containing the generated diagram code."""

    message: str = Field(..., description="A brief explanation of what was added or changed")
    code: str = Field(..., description="The final valid diagram code (Mermaid syntax or Draw.io XML)")
    format: str = Field(..., description="The format of the returned code: 'mermaid' or 'drawio'")
    status: str = Field("success", description="Processing status.")
