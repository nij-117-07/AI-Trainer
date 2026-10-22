import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_joke_coach_service", "verify_api_key"]


def get_joke_coach_service() -> Iterator["JokeCoachService"]:
    """
    Dependency provider for JokeCoachService.

    Yields:
        JokeCoachService: An initialized service instance.
    """
    from practice.joke_coach.services import JokeCoachService

    yield JokeCoachService()
