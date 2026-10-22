import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_grader_service", "verify_api_key"]


def get_grader_service() -> Iterator["GraderService"]:
    """
    Dependency provider for GraderService.

    Yields:
        GraderService: An initialized service instance.
    """
    from assessment.grader.services import GraderService

    yield GraderService()
