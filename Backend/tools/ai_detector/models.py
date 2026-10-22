import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class DetectionRecord(BaseModel):
    """
    ORM-style model representing an AI detection request.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique detection identifier")
    text_to_check: str = Field("", description="The text that was analyzed")
    additional_comments: str = Field("", description="Extra context supplied by the user")
    ai_score: float = Field(0.0, ge=0.0, le=1.0, description="AI probability score")
    verdict: str = Field("", description="Likely AI, Likely Human, or Mixed")
    reason: str = Field("", description="Explanation of the score")
    flagged_patterns: List[str] = Field(default_factory=list, description="Detected AI tells")
    suggested_changes: List[str] = Field(
        default_factory=list, description="Tips to make the text sound more human"
    )
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True


class HumanizationRecord(BaseModel):
    """
    ORM-style model representing a text humanization request.

    In a production system this would be a SQLAlchemy or Beanie document.
    For now it serves as a data contract for future database integration.
    """

    id: Optional[str] = Field(None, description="Unique humanization identifier")
    ai_text: str = Field("", description="The original AI-sounding text")
    target_tone: str = Field("conversational", description="Tone requested by the user")
    detection_feedback: str = Field("", description="Feedback from the AI Detector")
    additional_comments: str = Field("", description="Extra instructions supplied by the user")
    humanized_text: str = Field("", description="The rewritten, human-sounding text")
    changes_made: List[str] = Field(default_factory=list, description="Changes applied")
    confidence: float = Field(0.0, ge=0.0, le=1.0, description="Pass-as-human confidence")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    is_active: bool = True
