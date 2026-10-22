import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_foresight_service", "verify_api_key"]


def get_foresight_service() -> Iterator["ForesightService"]:
    """
    Dependency provider for ForesightService.

    Yields:
        ForesightService: An initialized service instance.
    """
    from practice.foresight_trainer.services import ForesightService

    yield ForesightService()
