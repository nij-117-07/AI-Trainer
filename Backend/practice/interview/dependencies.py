import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_interview_service", "verify_api_key"]


def get_interview_service() -> Iterator["InterviewService"]:
    """
    Dependency provider for InterviewService.

    Yields:
        InterviewService: An initialized service instance.
    """
    from practice.interview.services import InterviewService

    yield InterviewService()
