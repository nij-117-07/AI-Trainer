import logging
from typing import Iterator

from core.security import verify_api_key

logger = logging.getLogger(__name__)

__all__ = ["get_simulation_service", "get_chat_service", "verify_api_key"]


def get_simulation_service() -> Iterator["SimulationService"]:
    """
    Dependency provider for SimulationService.

    Yields:
        SimulationService: An initialized service instance.
    """
    from linguistic.simulator.services import SimulationService

    yield SimulationService()


def get_chat_service() -> Iterator["ChatService"]:
    """
    Dependency provider for ChatService.

    Yields:
        ChatService: An initialized service instance.
    """
    from linguistic.simulator.services import ChatService

    yield ChatService()
