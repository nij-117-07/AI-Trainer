import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_observation_trainer_service", "verify_api_key"]


def get_observation_trainer_service() -> Iterator["ObservationTrainerService"]:
    """
    Dependency provider for ObservationTrainerService.

    Yields:
        ObservationTrainerService: An initialized service instance.
    """
    from practice.observation_trainer.services import ObservationTrainerService

    yield ObservationTrainerService()
