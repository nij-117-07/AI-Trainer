from typing import Optional

import dspy
from pydantic import BaseModel, Field


class ImageToMarkdown(dspy.Signature):
    """
    You are a Vision-to-Markdown Expert. Analyze the provided image
    and convert its content into high-quality, well-structured Markdown.
    Maintain formatting like tables, headers, and lists.
    """

    image: dspy.Image = dspy.InputField(desc="The image object to be analyzed.")
    user_instruction: Optional[str] = dspy.InputField(desc="Instructions on what to extract.")

    markdown_output: str = dspy.OutputField(desc="The complete converted Markdown string.")


class VisionConversionResponse(BaseModel):
    """Response model containing the converted markdown."""

    markdown_output: str = Field(..., description="The complete converted Markdown string")
    status: str = "success"
