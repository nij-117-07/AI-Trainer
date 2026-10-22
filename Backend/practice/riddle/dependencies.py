import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_riddle_service", "verify_api_key"]


def get_riddle_service() -> Iterator["RiddleService"]:
    """
    Dependency provider for RiddleService.

    Yields:
        RiddleService: An initialized service instance.
    """
    from practice.riddle.services import RiddleService

    yield RiddleService()
