import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_clarity_trainer_service", "verify_api_key"]


def get_clarity_trainer_service() -> Iterator["ClarityTrainerService"]:
    """
    Dependency provider for ClarityTrainerService.

    Yields:
        ClarityTrainerService: An initialized service instance.
    """
    from practice.clarity_trainer.services import ClarityTrainerService

    yield ClarityTrainerService()
