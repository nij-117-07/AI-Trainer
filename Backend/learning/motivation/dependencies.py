import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_motivation_service", "verify_api_key"]


def get_motivation_service() -> Iterator["MotivationService"]:
    """
    Dependency provider for MotivationService.

    Yields:
        MotivationService: An initialized service instance.
    """
    from learning.motivation.services import MotivationService

    yield MotivationService()
