import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class InterviewSession(BaseModel):
    """
    ORM-style model representing a mock interview session.

    This mirrors the prototype's session state as a data contract for the
    client's session/memory app. The backend is stateless: the webapp persists
    this session and passes the relevant fields back on each request.
    """

    id: Optional[str] = Field(None, description="Unique session identifier")

    candidate_profile: Dict[str, Any] = Field(
        default_factory=dict, description="Candidate's background, experience, skills"
    )
    position_details: Dict[str, Any] = Field(
        default_factory=dict, description="Target role, company, required skills, JD"
    )
    interview_context: Dict[str, Any] = Field(
        default_factory=dict,
        description="Interviewer role, interview type, round, format, time budget",
    )

    session_history: List[Dict[str, Any]] = Field(
        default_factory=list, description="All Q&A so far with scores and reviews"
    )
    progress_state: Dict[str, Any] = Field(
        default_factory=dict, description="Current scores, weak/strong areas, topic coverage"
    )

    questions_asked: int = Field(0, description="How many questions asked so far")
    max_questions: int = Field(10, description="Total questions planned")
    started_at: Optional[datetime.datetime] = Field(
        None, description="When the session began — drives time_remaining_minutes"
    )
    duration_minutes: int = Field(60, description="Planned session length in minutes")
    time_remaining_minutes: int = Field(60, description="Minutes left in the session")

    current_question: Dict[str, Any] = Field(
        default_factory=dict,
        description="Active question from /question/generate (calibration data included)",
    )
    latest_review: Dict[str, Any] = Field(
        default_factory=dict, description="Most recent /answer/review result"
    )

    is_active: bool = Field(True, description="Whether the interview is ongoing")
    termination_reason: str = Field("", description="Why the interview ended, if it has")

    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
