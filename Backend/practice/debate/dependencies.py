import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_debate_service", "verify_api_key"]


def get_debate_service() -> Iterator["DebateService"]:
    """
    Dependency provider for DebateService.

    Yields:
        DebateService: An initialized service instance.
    """
    from practice.debate.services import DebateService

    yield DebateService()
