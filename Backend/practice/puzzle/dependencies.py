import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_puzzle_service", "verify_api_key"]


def get_puzzle_service() -> Iterator["PuzzleService"]:
    """
    Dependency provider for PuzzleService.

    Yields:
        PuzzleService: An initialized service instance.
    """
    from practice.puzzle.services import PuzzleService

    yield PuzzleService()
